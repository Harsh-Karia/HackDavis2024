import socket
import struct
import time
import os 

ROOT_SERVERS = ["198.41.0.4"]
DNS_PORT = 53
DOMAIN_NAME = "tmz.com"

transaction_id = os.urandom(2)
flags = b'\x01\x00'
qdcount = b'\x00' + b'\x01'
ancount = b'\x00' + b'\x00'
nscount = b'\x00' + b'\x00'
arcount = b'\x00' + b'\x00'
header = transaction_id + flags + qdcount + ancount + nscount + arcount
question = b''.join([bytes([len(part)]) + part.encode() for part in DOMAIN_NAME.split('.')]) + b'\x00'
qtype = b'\x00\x01'
qclass = b'\x00\x01'
query = header + question + qtype + qclass

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(15)

try:
    start_time = time.time()
    sock.sendto(query, (ROOT_SERVERS[0], DNS_PORT))
    print("Querying root DNS server...")
    response, _ = sock.recvfrom(512)
    end_time = time.time()
    root_rtt = end_time - start_time
    print("DNS Root Server RTT time: ", root_rtt)
    sock.close()
except socket.timeout:
    raise Exception(f"DNS request timed out for server {ROOT_SERVERS[0]}")

header_size = 12
question_end = response.find(b'\x00', header_size) + 5
answer_start = question_end

tld = DOMAIN_NAME.split('.')[-1]
tld_query = header + b''.join([bytes([len(part)]) + part.encode() for part in tld.split('.')]) + b'\x00' + qtype + qclass

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(15)

try:
    start_time = time.time()
    sock.sendto(tld_query, (ROOT_SERVERS[0], DNS_PORT))
    print("Querying TLD DNS server...")
    response, _ = sock.recvfrom(512)
    end_time = time.time()
    tld_rtt = end_time - start_time
    print("TLD DNS Server RTT time: ", tld_rtt)
    sock.close()
except socket.timeout:
    raise Exception(f"DNS request timed out for server {ROOT_SERVERS[0]}")

question_end = response.find(b'\x00', header_size) + 5
answer_start = question_end
abcd = []
while answer_start < len(response):
    answer_type = struct.unpack('!H', response[answer_start + 2:answer_start + 4])[0]
    data_length = struct.unpack('!H', response[answer_start + 10:answer_start + 12])[0]
    answer_data_start = answer_start + 12

    if answer_type == 1:
        record_type = "A"
        ip_address = ".".join(map(str, response[answer_data_start:answer_data_start + data_length]))
        print(f"DNS Record Type: {record_type}, IP Address: {ip_address}")
        abcd.append(ip_address)
    elif answer_type == 2:
        record_type = "NS"
        labels = []
        jumped = False
        original_offset = answer_data_start
        offset = answer_data_start
        while True:
            length = response[offset]
            if length & 0xC0 == 0xC0:
                pointer = struct.unpack('!H', response[offset:offset + 2])[0] & 0x3FFF
                if not jumped:
                    original_offset = offset + 2
                offset = pointer
                jumped = True
            else:
                offset += 1
                if length == 0:
                    break
                labels.append(response[offset:offset + length].decode())
                offset += length
        if not jumped:
            domain_name, _ = '.'.join(labels), offset
        else:
            domain_name, _ = '.'.join(labels), original_offset
        print(f"DNS Record Type: {record_type}, Domain Name: {domain_name}")
        try:
            ip_address = socket.gethostbyname(domain_name)
            print(f"Resolved IP Address: {ip_address}")
        except socket.gaierror:
            print(f"Unable to resolve nameserver {domain_name} to an IP address")
    elif answer_type == 28:
        record_type = "AAAA"
        ipv6_address = ":".join(
            f"{response[i]:02x}{response[i+1]:02x}"
            for i in range(answer_data_start, answer_data_start + data_length, 2)
        )
        print(f"DNS Record Type: {record_type}, IPv6 Address: {ipv6_address}")
    else:
        print(f"Unknown DNS Record Type: {answer_type}")

    answer_start += 12 + data_length

tld_server_ip = ip_address

encoded_domain_parts = []
for part in DOMAIN_NAME.split('.'):
    encoded_part = bytes([len(part)]) + part.encode()
    encoded_domain_parts.append(encoded_part)
encoded_domain = b''.join(encoded_domain_parts) + b'\x00'
domain_query = header + encoded_domain + qtype + qclass

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.settimeout(15)

try:
    start_time = time.time()
    sock.sendto(domain_query, (tld_server_ip, DNS_PORT))
    print("Querying Authoritative DNS server...")
    response, _ = sock.recvfrom(512)
    end_time = time.time()
    auth_rtt = end_time - start_time
    print("Authoritative DNS Server RTT time: ", auth_rtt)

    question_end = response.find(b'\x00', header_size) + 5
    answer_start = question_end
    abcd = []

    while answer_start < len(response):
        answer_type = struct.unpack('!H', response[answer_start + 2:answer_start + 4])[0]
        data_length = struct.unpack('!H', response[answer_start + 10:answer_start + 12])[0]
        answer_data_start = answer_start + 12

        if answer_type == 1:  # A record
            record_type = "A"
            ip_address = ".".join(map(str, response[answer_data_start:answer_data_start + data_length]))
            print(f"DNS Record Type: {record_type}, IP Address: {ip_address}")
            abcd.append(ip_address)
        elif answer_type == 2:  # NS record
            record_type = "NS"
            labels = []
            jumped = False
            original_offset = answer_data_start
            offset = answer_data_start

            while True:
                length = response[offset]
                if length & 0xC0 == 0xC0:  # Pointer to another part of the message
                    pointer = struct.unpack('!H', response[offset:offset + 2])[0] & 0x3FFF
                    if not jumped:
                        original_offset = offset + 2
                    offset = pointer
                    jumped = True
                else:
                    offset += 1
                    if length == 0:  # End of labels
                        break
                    labels.append(response[offset:offset + length].decode())
                    offset += length

            if not jumped:
                domain_name, _ = '.'.join(labels), offset
            else:
                domain_name, _ = '.'.join(labels), original_offset
            print(f"DNS Record Type: {record_type}, Domain Name: {domain_name}")
            try:
                ip_address = socket.gethostbyname(domain_name)
                print(f"Resolved IP Address: {ip_address}")
            except socket.gaierror:
                print(f"Unable to resolve nameserver {domain_name} to an IP address")
        elif answer_type == 28:  # AAAA record (IPv6)
            record_type = "AAAA"
            ipv6_address = ":".join(
                f"{response[i]:02x}{response[i+1]:02x}"
                for i in range(answer_data_start, answer_data_start + data_length, 2)
            )
            print(f"DNS Record Type: {record_type}, IPv6 Address: {ipv6_address}")
        else:
            print(f"Unknown DNS Record Type: {answer_type}")

        answer_start += 12 + data_length

    # Save final IP for querying
    auth_server_ip = ip_address
    print("Auth IP is: ", auth_server_ip)
    sock.close()
except socket.timeout:
    raise Exception(f"DNS request timed out for server {tld_server_ip}")

print("-----------------------------")

print("Get host my name outputs: ", socket.gethostbyname("tmz.com"))
try:
    ip_address = abcd[0]
except socket.gaierror:
    raise Exception("Unable to resolve domain example.com to an IP address")

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect((socket.gethostbyname("tmz.com"), 80))
request = "GET / HTTP/1.1\r\nHost: tmz.com\r\nConnection: close\r\n\r\n"
sock.sendall(request.encode())

response = b""
while True:
    part = sock.recv(4096)
    if not part:
        break
    response += part

print(response.decode(errors='ignore'))
sock.close()

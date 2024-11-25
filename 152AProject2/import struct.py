import struct
import socket

def header_to_bytes(id, flags, num_questions, num_answers, num_authorities, num_additionals):
    fields = tuple(id, flags, num_questions, num_answers, num_authorities, num_additionals)
    # there are 6 `H`s because there are 6 fields
    return struct.pack("!HHHHHH", *fields)

def question_to_bytes(name, type_, class_):
    return name + struct.pack("!HH", type_, class_)

def encode_dns_name(domain_name):
    encoded = b""
    for part in domain_name.encode("ascii").split(b"."):
        encoded += bytes([len(part)]) + part
    return encoded + b"\x00"

import random
random.seed(1)

TYPE_A = 1
CLASS_IN = 1

def build_query(domain_name, record_type):
    name = encode_dns_name(domain_name)
    id = random.randint(0, 65535)
    RECURSION_DESIRED = 1 << 8
    header = header_to_bytes(id=id, flags=RECURSION_DESIRED, num_questions=1, num_answers=0, num_authorities=0, num_additionals=0)
    question = question_to_bytes(name=name, type_=record_type, class_=CLASS_IN)
    return header_to_bytes(header) + question_to_bytes(question)

query = build_query("www.tmz.com", 1)
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(query, ("2001:503:ba3e::2:30", 53))
response, _ = sock.recvfrom(1024)
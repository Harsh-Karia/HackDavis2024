import {
  Container,
  InputGroup,
  FormControl,
  Button,
  Row,
  Card,
  Modal,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
export const Review = () => {
  const CLIENT_ID = "a6a8e1cfc37242e8acb2c20dbdefafa9";
  const CLIENT_SECRET = "be3e3d9c66664a949773fdcd46e2c524";
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [albResults, setAlbResults] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [show, setShow] = useState(false);
  const [review, setReview] = useState("");
  const [songName, setSongName] = useState("");
  const [songImage, setSongImage] = useState("");
  const [songRelease, setSongRelease] = useState("");
  const [artName, setArtName] = useState("");
  const navigate = useNavigate();
  const usid = localStorage.getItem("userID");
  console.log(usid);
  useEffect(() => {
    var authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        CLIENT_ID +
        "&client_secret=" +
        CLIENT_SECRET,
    };

    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  //Search function
  const handleCardClick = async (i) => {
    setSelectedCard(i);
    setSongName(searchResults[i].name);
    setSongImage(albResults[i].images[0].url);
    setSongRelease(albResults[i].release_date);

    console.log(songName);
    console.log(songImage);
    console.log(songRelease);
  };

  function formatDate(inputDate) {
    // Parse the input date string
    const dateParts = inputDate.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);

    // Define an array of month names
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Get the month name using the parsed month value
    const monthName = monthNames[month - 1]; // Months are 0-based in JavaScript Date objects

    // Format the date in "Month Day, Year" format
    const formattedDate = `${monthName} ${day}, ${year}`;

    return formattedDate;
  }

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);
  const handleSubmit = async () => {
    const data = {
      artistName: artName,
      songName: songName,
      releaseDate: formatDate(songRelease),
      imageUrl: songImage,
      songReview: review,
      userOwner: localStorage.getItem("username"),
    };
    console.log(data);
    try {
      const response = await axios.post("http://localhost:3001/review", data);
      console.log(response.data);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  async function search() {
    console.log("Search for ", searchInput);

    try {
      var searchParameters = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      };

      var artistId = await fetch(
        "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
        searchParameters
      )
        .then((response) => response.json())
        .then((data) => {
          return data.artists.items[0].id;
        });

      // Extract the artist name from the response

      const albumsResponse = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=US`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Replace with your access token
          },
        }
      );

      const albumsData = await albumsResponse.json();
      console.log(albumsData);
      const allTracks = [];
      const respectiveData = [];
      for (const album of albumsData.items) {
        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/albums/${album.id}/tracks`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`, // Replace with your access token
            },
          }
        );
        const tracksData = await tracksResponse.json();
        console.log(tracksData.items);
        allTracks.push(...tracksData.items);

        for (const alb of tracksData.items) {
          respectiveData.push(album);
        }
      }
      setSearchResults(allTracks);
      setAlbResults(respectiveData);
      setArtName(respectiveData[0].artists[0].name);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    usid && (
      <div className="abc">
        <Container>
          <InputGroup size="lg">
            <FormControl
              placeholder="Search for Artist"
              type="input"
              onKeyDown={(event) => {
                if (event.key == "Enter") {
                  search();
                }
              }}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <Button onClick={search}>Search</Button>
          </InputGroup>
        </Container>

        <Container style={{ padding: 10 }}>
          <Row className="mx-2 row row-cols-4">
            {searchResults.map((album, i) => {
              return (
                <Card
                  key={i}
                  style={{
                    backgroundColor:
                      i === selectedCard ? "lightblue" : "transparent",
                    margin: 25,
                    // Add any other inline styles here
                  }}
                  onClick={() => {
                    handleCardClick(i);
                    handleShow();
                  }}
                >
                  <Card.Img src={albResults[i].images[0].url} />
                  <Card.Body>
                    <Card.Title>{album.name}</Card.Title>
                    <Card.Text>
                      {formatDate(albResults[i].release_date)}
                    </Card.Text>
                    <Card.Text>{albResults[i].artists[0].name}</Card.Text>
                  </Card.Body>
                </Card>
              );
            })}
          </Row>
        </Container>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Submit review for {songName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>Released: {songRelease}</Modal.Body>
          <Modal.Body
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img src={songImage} alt="Song" />
          </Modal.Body>
          <Modal.Body
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {artName}
          </Modal.Body>

          <Container style={{ marginBottom: 30 }}>
            <InputGroup size="lg">
              <Form.Control
                as="textarea"
                style={{ paddingBottom: 50 }}
                placeholder="Enter Review"
                onKeyDown={(event) => {
                  console.log("Abc");
                }}
                onChange={(event) => setReview(event.target.value)}
              />
            </InputGroup>
          </Container>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  );
};

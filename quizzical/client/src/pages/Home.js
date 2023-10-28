import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Image, Card } from "react-bootstrap";
export const Home = () => {
  const [data, setData] = useState([]);
  const usid = localStorage.getItem("userID");
  useEffect(() => {
    // Make a GET request to your API endpoint
    axios
      .get("http://localhost:3001/review")
      .then((response) => {
        // Update the state with the fetched data
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    usid && (
      <Container className="mt-5 text-center">
        {" "}
        {/* Apply text-center class to center-align content */}
        <Row>
          {data.map((item, index) => (
            <Col md={4} key={index}>
              {" "}
              {/* Added a unique key */}
              <Card className="mb-4">
                <Card.Img src={item.imageUrl} />

                <Card.Body>
                  <Card.Title style={{ fontSize: 30 }}>
                    {item.songName}
                  </Card.Title>
                  <Card.Subtitle
                    style={{ fontSize: 20 }}
                    className="mb-2 text-muted"
                  >
                    {item.artistName}
                  </Card.Subtitle>
                  <Card.Body>
                    <Card.Text style={{ fontSize: 20 }}>
                      {item.songReview}
                    </Card.Text>
                  </Card.Body>
                  <Card.Text style={{ fontSize: 20 }}>
                    Release Date: {item.releaseDate}
                  </Card.Text>
                  <Card.Text style={{ fontSize: 20 }}>
                    Review by: {item.userOwner}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    )
  );
};

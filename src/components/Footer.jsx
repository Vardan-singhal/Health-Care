import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaHeart,
} from "react-icons/fa";

export default function Footer({ darkMode }) {
  const bgClass = darkMode ? "bg-dark text-light" : "bg-light text-dark";
  const textMuted = darkMode ? "text-secondary" : "text-muted";

  return (
    <footer className={`${bgClass} mt-auto py-4 border-top`}>
      <Container>
        <Row className="align-items-center text-center text-md-start">
          {/* Brand / Logo */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="fw-bold">HealthCare Portal</h5>
            <p className={`mb-0 ${textMuted}`}>
              Your trusted partner for a healthier tomorrow.
            </p>
          </Col>

          {/* Navigation Links */}
          <Col md={4} className="mb-3 mb-md-0">
            <ul className="list-unstyled d-flex justify-content-center justify-content-md-start gap-3 mb-0">
              <li>
                <a href="/landing" className={`text-decoration-none ${textMuted}`}>
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className={`text-decoration-none ${textMuted}`}>
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className={`text-decoration-none ${textMuted}`}>
                  Contact
                </a>
              </li>
            </ul>
          </Col>

          {/* Social Media Icons */}
          <Col
            md={4}
            className="d-flex justify-content-center justify-content-md-end align-items-center gap-3"
          >
            <a
              href="https://facebook.com"
              className={`fs-5 ${textMuted}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook />
            </a>
            <a
              href="https://twitter.com"
              className={`fs-5 ${textMuted}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com"
              className={`fs-5 ${textMuted}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              className={`fs-5 ${textMuted}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin />
            </a>
          </Col>
        </Row>

        <hr className={`${textMuted} my-3`} />

        {/* Copyright */}
        <Row>
          <Col className="text-center">
            <p className={`mb-0 ${textMuted}`}>
              © {new Date().getFullYear()} HealthCare Portal. Made with{" "}
              <FaHeart className="text-danger" /> by <strong>Your Team</strong>.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

import React from "react";
import { Container } from "react-bootstrap";

const Footer = () => {
    return (
        <footer className="bg-black text-white text-center py-2">
            <Container>
                <small>© {new Date().getFullYear()} Super Market POS | Designed by Bavithragithan Kuganesan</small>
            </Container>
        </footer>
    );
};

export default Footer;

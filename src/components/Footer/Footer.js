import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-top">
      <div className="footer-container">
        <div className="footer-col">
          <h4>ABOUT</h4>
          <ul>
            <li><a href="#contact">Contact Us</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#press">Press</a></li>
            <li><a href="#corporate">Corporate Information</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>GROUP COMPANIES</h4>
          <ul>
            <li><a href="https://myntra.com" target="_blank" rel="noreferrer">Myntra</a></li>
            <li><a href="#cleartrip">Cleartrip</a></li>
            <li><a href="#shopsy">Shopsy</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>HELP</h4>
          <ul>
            <li><a href="#payments">Payments</a></li>
            <li><a href="#shipping">Shipping</a></li>
            <li><a href="#cancellation">Cancellation & Returns</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#report">Report Infringement</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>CONSUMER POLICY</h4>
          <ul>
            <li><a href="#cancellation">Cancellation & Returns</a></li>
            <li><a href="#terms">Terms Of Use</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#sitemap">Sitemap</a></li>
            <li><a href="#grievance">Grievance Redressal</a></li>
          </ul>
        </div>
        <div className="footer-col footer-col-wide">
          <div className="footer-mail">
            <h4>Mail Us:</h4>
            <address>
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </address>
          </div>
          <div className="footer-registered">
            <h4>Registered Office Address:</h4>
            <address>
              Flipkart Internet Private Limited,<br />
              Buildings Alyssa, Begonia &<br />
              Clove Embassy Tech Village,<br />
              Outer Ring Road, Devarabeesanahalli Village,<br />
              Bengaluru, 560103,<br />
              Karnataka, India
            </address>
            <p>CIN: U51109KA2012PTC066107</p>
            <p>Telephone: 044-45614700</p>
          </div>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="footer-container footer-bottom-inner">
        <div className="footer-bottom-links">
          <a href="#seller">Become a Seller</a>
          <span>·</span>
          <a href="#advertise">Advertise</a>
          <span>·</span>
          <a href="#gift">Gift Cards</a>
          <span>·</span>
          <a href="#help">Help Center</a>
        </div>
        <div className="footer-copyright">
          <span>© 2007-2024 Flipkart.com</span>
          <div className="footer-payments">
            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/payment-method_69e7ec.svg" alt="payments" />
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

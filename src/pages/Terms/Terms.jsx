import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Terms.css";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Terms() {
  usePageTitle("Terms & Conditions");
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const revealEls = Array.from(container.querySelectorAll(".reveal-el"));
    if (!revealEls.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );

    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="terms-page" ref={containerRef}>
      <section className="terms-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Terms &amp; Condition</h1>
          <div className="breadcrumb">
            <Link to="/">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 10.5L12 3L21 10.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 9.5V21H19V9.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Home
            </Link>
            <span className="crumb-sep">›</span>
            <span className="crumb-current">Terms</span>
          </div>
        </div>
      </section>

      <section className="terms-content">
        <p className="last-updated reveal-el">
          Last updated: February 18, 2021
        </p>

        <p className="reveal-el">
          "Synergein" is a trademark of Synergein Private Limited ("Company"), a
          company incorporated under the Companies Act, 2013 with its registered
          and corporate office at Plot 64H, Sector 18, Gudgeon 122001 in the
          course of its business. The domain name synergein.com is owned by the
          Company.
        </p>

        <p className="reveal-el">
          If you are a California resident, the information below also applies
          to you. Certain terms used in this section have the meanings given to
          them in the California Consumer Privacy Act of 2018 ("CCPA").
        </p>

        <p className="reveal-el">
          Customer are advised to read and understand our Privacy Policy
          carefully, as by accessing the website/app you agree to be bound by
          the terms and conditions of the Privacy Policy and consent to the
          collection, storage and use of information relating to you as provided
          herein.
        </p>

        <p className="reveal-el">
          If you do not agree with the terms and conditions of our Privacy
          Policy, including in relation to the manner of collection or use of
          your information, please do not use or access the website/app.
        </p>

        <p className="reveal-el">
          Our Privacy Policy is incorporated into the Terms and Conditions of
          Use of the website/app, and is subject to change from time to time
          without notice. It is strongly recommended that you periodically
          review our Privacy Policy as posted on the App/Web.
        </p>

        <p className="reveal-el">
          Should you have any clarifications regarding this Privacy Policy,
          please do not hesitate to contact us at{" "}
          <a href="mailto:mamluk@mamluk.in" className="inline-link">
            mamluk@mamluk.in
          </a>
          .
        </p>

        <h2 className="reveal-el">
          The Collection, Storage and Use of Information Related to You
        </h2>

        <p className="reveal-el">
          We may automatically track certain information about you based upon
          your behavior on the website. We use this information to do internal
          research on our users' demographics, interests, and behavior to better
          understand, protect and serve our users. This information is compiled
          and analyzed on an aggregated basis. This information may include the
          URL that you just came from (whether this URL is on the website or
          not), which URL you next go to (whether this URL is on the website or
          not), your computer browser information, your IP address, and other
          information associated with your interaction with the website.{" "}
          <strong>
            We may also share your Mobile IP/Device IP with third party(ies) and
            to the best of our knowledge, be-life and representations given to
            us by these third party(ies) this information is not stored.
          </strong>
        </p>

        <ul className="terms-list reveal-el">
          <li>
            Identifiers (e.g. name, mailing address, email address, phone
            number, credit/debit card number)
          </li>
          <li>
            Characteristics of protected classifications (e.g. gender, age)
          </li>
          <li>
            Commercial information (e.g. products or services purchased,
            purchase history)
          </li>
          <li>
            Internet or other electronic network activity (e.g. browse or search
            history)
          </li>
          <li>Geo location data (e.g. latitude or longitude)</li>
          <li>
            Audio, electronic, visual, or similar information (e.g. recording of
            Guest service calls)
          </li>
          <li>
            Inferences drawn from any of the above (e.g. preferences or
            characteristics)
          </li>
        </ul>

        <h2 className="reveal-el">
          Choices Available Regarding Collection, Use and Distribution of
          Information
        </h2>

        <p className="reveal-el">
          To protect against the loss, misuse and alteration of the information
          under its control, the Company has in place appropriate physical,
          electronic and managerial procedures. For example, the Company servers
          are accessible only to authorized personnel and your information is
          shared with employees and authorized personnel on a need to know basis
          to complete the transaction and to provide the services requested by
          you. Although the Company endeavour to safeguard the confidentiality
          of your personally identifiable information, transmissions made by
          means of the Internet cannot be made absolutely secure. By using the
          website, you agree that the Company will have no liability for
          disclosure of your information due to errors in transmission and/or
          unauthorized acts of third parties.
        </p>

        <p className="reveal-el">
          Please note that the Company will not ask you to share any sensitive
          data or information via email or telephone. If you receive any such
          request by email or telephone, please do not respond/divulge any
          sensitive data or information and forward the information relating to
          the same to{" "}
          <a href="mailto:mamluk@mamluk.in" className="inline-link">
            mamluk@mamluk.in
          </a>
          for necessary action.
        </p>

        <ol className="terms-list numbered reveal-el">
          <li>
            Performing services, including maintaining or servicing accounts,
            providing customer service, processing or fulfilling orders and
            transactions, verifying customer information, processing payments,
            providing advertising or marketing services, providing analytics
            services, or providing similar services;
          </li>
          <li>
            Auditing related to a current interaction with you and concurrent
            transactions, including, but not limited to, counting ad impressions
            to unique visitors, verifying positioning and quality of ad
            impressions, and auditing compliance;
          </li>
          <li>
            Short-term, transient use, including, but not limited to, the
            contextual customization of ads shown as part of the same
            interaction;
          </li>
          <li>
            Detecting security incidents, protecting against malicious,
            deceptive, fraudulent, or illegal activity, and prosecuting those
            responsible for that activity;
          </li>
          <li>
            Debugging to identify and repair errors that impair existing
            intended functionality;
          </li>
          <li>
            Undertaking internal research for technological development and
            demonstration; and
          </li>
          <li>
            Undertaking activities to verify or maintain the quality or safety
            of a service or device that is owned, manufactured, manufactured
            for, or controlled by us, and to improve, upgrade, or enhance the
            service or device that is owned, manufactured, manufactured for, or
            controlled by us.
          </li>
        </ol>
      </section>
    </div>
  );
}

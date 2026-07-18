import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Privacy.css";

// Section data — id is used both for the sidebar link and to find the
// matching <section> in the DOM for scroll-spy tracking.
const sections = [
  { id: "personal-information", label: "Personal Information" },
  { id: "snap", label: "Snap" },
  { id: "other-information", label: "Other Information" },
  { id: "links", label: "Links" },
  { id: "third-party-advertisers", label: "Third Party Advertisers" },
  { id: "security", label: "Security" },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  // One ref per section element, stored in a plain object keyed by id,
  // so the IntersectionObserver effect can look them up without
  // querying the DOM by class name.
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function scrollToSection(id) {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  }

  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Privacy &amp; Policy</h1>
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
            <span className="crumb-current">Privacy</span>
          </div>
        </div>
      </section>

      <div className="privacy-layout">
        <aside className="privacy-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`privacy-nav-link ${activeSection === section.id ? "active" : ""}`}
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </aside>

        <article className="privacy-content">
          <section
            id="personal-information"
            ref={(el) => (sectionRefs.current["personal-information"] = el)}
          >
            <h2>Personal Information</h2>
            <p>
              "Synergein" is a trademark of Synergein Private Limited
              ("Company"), a company incorporated under the Companies Act, 2013
              with its registered and corporate office at Plot 64H, Sector 18,
              Gudgeon 122001 in the course of its business. The domain name
              synergein.com is owned by the Company.
            </p>
            <p>
              If you are a California resident, the information below also
              applies to you. Certain terms used in this section have the
              meanings given to them in the California Consumer Privacy Act of
              2018 ("CCPA").
            </p>
          </section>

          <section id="snap" ref={(el) => (sectionRefs.current["snap"] = el)}>
            <h2>Snap</h2>
            <p>
              Customer are advised to read and understand our Privacy Policy
              carefully, as by accessing the website/app you agree to be bound
              by the terms and conditions of the Privacy Policy and consent to
              the collection, storage and use of information relating to you as
              provided herein.
            </p>
            <p>
              If you do not agree with the terms and conditions of our Privacy
              Policy, including in relation to the manner of collection or use
              of your information, please do not use or access the website/app.
            </p>
            <p>
              Our Privacy Policy is incorporated into the Terms and Conditions
              of Use of the website/app, and is subject to change from time to
              time without notice. It is strongly recommended that you
              periodically review our Privacy Policy as posted on the App/Web.
            </p>
          </section>

          <section
            id="other-information"
            ref={(el) => (sectionRefs.current["other-information"] = el)}
          >
            <h2>Other Information</h2>
            <p>
              We may automatically track certain information about you based
              upon your behavior on the website. We use this information to do
              internal research on our users' demographics, interests, and
              behavior to better understand, protect and serve our users. This
              information is compiled and analyzed on an aggregated basis. This
              information may include the URL that you just came from (whether
              this URL is on the website or not), which URL you next go to
              (whether this URL is on the website or not), your computer browser
              information, your IP address, and other information associated
              with your interaction with the website.{" "}
              <strong>
                We may also share your Mobile IP/Device IP with third party(ies)
                and to the best of our knowledge, be-life and representations
                given to us by these third party(ies) this information is not
                stored.
              </strong>
            </p>
          </section>

          <section id="links" ref={(el) => (sectionRefs.current["links"] = el)}>
            <h2>Links</h2>
            <p>
              We use this information to do internal research on our users'
              demographics, interests, and behavior to better understand,
              protect and serve our users. This information is compiled and
              analyzed on an aggregated basis. This information may include the
              URL that you just came from (whether this URL is on the website or
              not), which URL you next go to (whether this URL is on the website
              or not), your computer browser information, your IP address
            </p>
            <ol>
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
                Internet or other electronic network activity (e.g. browse or
                search history)
              </li>
              <li>Geo location data (e.g. latitude or longitude)</li>
              <li>
                Audio, electronic, visual, or similar information (e.g.
                recording of Guest service calls)
              </li>
              <li>
                Inferences drawn from any of the above (e.g. preferences or
                characteristics)
              </li>
            </ol>
          </section>

          <section
            id="third-party-advertisers"
            ref={(el) => (sectionRefs.current["third-party-advertisers"] = el)}
          >
            <h2>Third Party Advertisers</h2>
            <p>
              To protect against the loss, misuse and alteration of the
              information under its control, the Company has in place
              appropriate physical, electronic and managerial procedures. For
              example, the Company servers are accessible only to authorized
              personnel and your information is shared with employees and
              authorized personnel on a need to know basis to complete the
              transaction and to provide the services requested by you. Although
              the Company endeavour to safeguard the confidentiality of your
              personally identifiable information, transmissions made by means
              of the Internet cannot be made absolutely secure. By using the
              website, you agree that the Company will have no liability for
              disclosure of your information due to errors in transmission
              and/or unauthorized acts of third parties.
            </p>
          </section>

          <section
            id="security"
            ref={(el) => (sectionRefs.current["security"] = el)}
          >
            <h2>Security</h2>
            <p>
              Please note that the Company will not ask you to share any
              sensitive data or information via email or telephone. If you
              receive any such request by email or telephone, please do not
              respond/divulge any sensitive data or information and forward the
              information relating to the same to{" "}
              <a href="mailto:info@synergein.com" className="inline-link">
                info@synergein.com
              </a>{" "}
              for necessary action.
            </p>
            <ol>
              <li>
                Performing services, including maintaining or servicing
                accounts, providing customer service, processing or fulfilling
                orders and transactions, verifying customer information,
                processing payments, providing advertising or marketing
                services, providing analytics services, or providing similar
                services;
              </li>
              <li>
                Auditing related to a current interaction with you and
                concurrent transactions, including, but not limited to, counting
                ad impressions to unique visitors, verifying positioning and
                quality of ad impressions, and auditing compliance;
              </li>
              <li>
                Short-term, transient use, including, but not limited to, the
                contextual customization of ads shown as part of the same
                interaction;
              </li>
              <li>
                Detecting security incidents, protecting against malicious,
                deceptive, fraudulent, or illegal activity, and prosecuting
                those responsible for that activity;
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
                Undertaking activities to verify or maintain the quality or
                safety of a service or device that is owned, manufactured,
                manufactured for, or controlled by us, and to improve, upgrade,
                or enhance the service or device that is owned, manufactured,
                manufactured for, or controlled by us.
              </li>
            </ol>
          </section>
        </article>
      </div>
    </div>
  );
}

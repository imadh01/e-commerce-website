import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./Privacy.css";
import { usePageTitle } from "../../hooks/usePageTitle";

const sections = [
  { id: "who-we-are", label: "Who We Are" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "how-we-share", label: "How We Share Your Information" },
  { id: "how-we-protect", label: "How We Protect Your Information" },
  { id: "how-long", label: "How Long We Keep Your Information" },
  { id: "your-rights", label: "Your Rights and Choices" },
  { id: "account-deletion", label: "Account and Data Deletion" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function Privacy() {
  usePageTitle("Privacy Policy");
  const [activeSection, setActiveSection] = useState(sections[0].id);
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
      { rootMargin: "-30% 0px -60% 0px" },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function scrollTo(id) {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <h1>Privacy Policy</h1>
        <p>Last updated: June 25, 2026</p>
      </div>

      <div className="privacy-layout">
        {/* Sidebar */}
        <aside className="privacy-sidebar">
          <nav>
            {sections.map((s) => (
              <button
                key={s.id}
                className={`privacy-nav-link ${activeSection === s.id ? "active" : ""}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="privacy-content">
          <p className="privacy-intro">
            This Privacy Policy explains how Mamluk Pvt Ltd ("Mamluk," "we,"
            "us," or "our") collects, uses, shares, and protects your
            information when you use the Mamluk mobile application (the "App")
            and the grocery ordering and delivery services we provide through it
            (the "Services"). By creating an account or placing an order through
            the App, you agree to the practices described in this Privacy
            Policy. If you do not agree, please do not use the App.
          </p>

          <section
            id="who-we-are"
            ref={(el) => (sectionRefs.current["who-we-are"] = el)}
          >
            <h2>1. Who We Are</h2>
            <p>
              The App is operated by Mamluk Pvt Ltd, located at 1317-D, EC Road,
              Manamelkudi – 614 620, India. We provide an online grocery
              ordering and home-delivery service operating in India. If you have
              any questions about this policy, you can reach us using the
              details in the Contact Us section below.
            </p>
          </section>

          <section
            id="information-we-collect"
            ref={(el) => (sectionRefs.current["information-we-collect"] = el)}
          >
            <h2>2. Information We Collect</h2>
            <p>
              We only collect the information we need to take and deliver your
              grocery orders.
            </p>

            <h3>2.1 Information You Provide to Us</h3>
            <p>When you create an account and place orders, we collect:</p>
            <ul>
              <li>
                <strong>Account details</strong> — your name, phone number, and
                email address.
              </li>
              <li>
                <strong>Login credentials</strong> — your password (stored in a
                hashed, non-readable form).
              </li>
              <li>
                <strong>Delivery details</strong> — your delivery address(es).
              </li>
              <li>
                <strong>Order details</strong> — the items you order, order
                history, and any notes or instructions you add to an order.
              </li>
              <li>
                <strong>Payment method preference</strong> — the payment option
                you select for an order (for example, cash on delivery).
              </li>
            </ul>

            <h3>2.2 Payment Information — What We Do Not Collect</h3>
            <p>
              We do not collect or store card numbers, bank account details, UPI
              IDs, CVV/security codes, or any other financial account
              credentials. Payment for your order is made at the time of
              delivery, directly to the delivery person, using the method you
              selected. The App only records which method you chose, not any
              financial credentials.
            </p>

            <h3>2.3 Information Collected Automatically</h3>
            <p>
              When you use the App, our servers receive limited technical
              information needed to operate and secure the Service, such as your
              device type, operating system version, app version, and basic
              request logs. We do not use third-party advertising or analytics
              services, and the App does not collect your device location.
            </p>
          </section>

          <section
            id="how-we-use"
            ref={(el) => (sectionRefs.current["how-we-use"] = el)}
          >
            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>create and manage your account;</li>
              <li>
                receive, verify, process, and deliver your grocery orders;
              </li>
              <li>
                contact you about an order (for example, to confirm details,
                arrange delivery, or resolve a problem);
              </li>
              <li>
                maintain your order history so you can reorder and so we can
                provide support;
              </li>
              <li>
                operate, secure, troubleshoot, and improve the App and Service;
                and
              </li>
              <li>comply with our legal obligations.</li>
            </ul>
            <p>
              We do not use your information for advertising or marketing
              profiling, and we do not sell your personal information.
            </p>
          </section>

          <section
            id="how-we-share"
            ref={(el) => (sectionRefs.current["how-we-share"] = el)}
          >
            <h2>4. How We Share Your Information</h2>
            <p>
              We share your information only as needed to provide the Service,
              and only with:
            </p>
            <ul>
              <li>
                <strong>Our delivery personnel</strong>, who receive your name,
                delivery address, phone number, and order details so they can
                deliver your order and collect payment.
              </li>
              <li>
                <strong>Our customer care and operations staff</strong>, who
                verify and process your order through our internal system.
              </li>
              <li>
                <strong>Service providers</strong> that help us run the App (for
                example, server/cloud hosting and messaging providers). These
                providers may only use your information to perform services for
                us.
              </li>
              <li>
                <strong>Legal and safety</strong>, where we reasonably believe
                disclosure is required by applicable law, legal process, or a
                lawful request by a public authority, or to protect our rights,
                users, or the public.
              </li>
            </ul>
            <p>
              We do not sell your personal information to third parties, and we
              do not share it with advertisers.
            </p>
          </section>

          <section
            id="how-we-protect"
            ref={(el) => (sectionRefs.current["how-we-protect"] = el)}
          >
            <h2>5. How We Protect Your Information</h2>
            <p>
              We take reasonable measures to protect your information,
              including:
            </p>
            <ul>
              <li>
                access to customer and order data is restricted to authorised
                customer care and administrator staff only;
              </li>
              <li>
                our internal data-access interfaces are protected and require
                authenticated, token-based access;
              </li>
              <li>
                you can only view your own profile and order information by
                logging into the App with your own credentials; and
              </li>
              <li>data is transmitted over secure, encrypted connections.</li>
            </ul>
            <p>
              No method of transmission or storage is completely secure, so
              while we work to protect your information, we cannot guarantee
              absolute security.
            </p>
          </section>

          <section
            id="how-long"
            ref={(el) => (sectionRefs.current["how-long"] = el)}
          >
            <h2>6. How Long We Keep Your Information</h2>
            <p>
              We keep your account and order information for as long as your
              account is active or as needed to provide the Service to you. We
              may retain limited information after account closure where
              necessary for legitimate purposes such as completing pending
              orders, fraud prevention, accounting, or meeting legal and
              regulatory requirements. When information is no longer needed for
              these purposes, we delete or anonymise it.
            </p>
          </section>

          <section
            id="your-rights"
            ref={(el) => (sectionRefs.current["your-rights"] = el)}
          >
            <h2>7. Your Rights and Choices</h2>
            <ul>
              <li>
                Access and update your account and profile information at any
                time by logging into the App.
              </li>
              <li>
                Request deletion of your account and associated personal data
                (see the next section).
              </li>
              <li>
                Contact us with any privacy request or question using the
                details below.
              </li>
            </ul>
            <p>
              Depending on applicable law, you may have the right to access,
              correct, or delete your personal information, including under
              India's Digital Personal Data Protection Act, 2023. To exercise
              any right, contact us using the details below; we may need to
              verify your identity before acting on a request.
            </p>
          </section>

          <section
            id="account-deletion"
            ref={(el) => (sectionRefs.current["account-deletion"] = el)}
          >
            <h2>8. Account and Data Deletion</h2>
            <p>
              You can request deletion of your account and the personal
              information linked to it at any time through our Account &amp;
              Data Deletion page:
            </p>
            <p>
              <strong>Data Deletion Pathway:</strong>
              <br />
              <a
                href="https://mamlukprod.synergeinsolutions.com/data-deletion"
                target="_blank"
                rel="noopener noreferrer"
                className="privacy-link"
              >
                https://mamlukprod.synergeinsolutions.com/data-deletion
              </a>
            </p>
            <p>
              That page explains how to request deletion, including how to
              submit a request if you have already uninstalled the App. After we
              confirm the request is from the account holder, we delete or
              anonymise your personal information — such as your name, phone
              number, email address, and saved addresses — within 7 business
              days. We may retain a limited amount of information (such as
              transaction records and invoices) where required for legal,
              accounting, tax, or fraud-prevention purposes, as described in
              Section 6.
            </p>
          </section>

          <section
            id="childrens-privacy"
            ref={(el) => (sectionRefs.current["childrens-privacy"] = el)}
          >
            <h2>9. Children's Privacy</h2>
            <p>
              The App is intended for users aged 18 and over. We do not
              knowingly collect personal information from anyone under 18. If
              you believe a minor has provided us with personal information,
              please contact us and we will take steps to delete it.
            </p>
          </section>

          <section
            id="changes"
            ref={(el) => (sectionRefs.current["changes"] = el)}
          >
            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will revise the "Last updated" date at the top and, where
              appropriate, notify you within the App. Your continued use of the
              App after an update means you accept the revised policy.
            </p>
          </section>

          <section
            id="contact"
            ref={(el) => (sectionRefs.current["contact"] = el)}
          >
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests about this
              Privacy Policy or your personal information, contact us at:
            </p>
            <address>
              <strong>Mamluk Pvt Ltd</strong>
              <br />
              1317-D, EC Road, Manamelkudi – 614 620, India
              <br />
              Email:{" "}
              <a href="mailto:mamluk@mamluk.in" className="privacy-link">
                mamluk@mamluk.in
              </a>
            </address>
            <p className="mt-3">
              <Link to="/contact" className="privacy-link">
                Use our Contact Form →
              </Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

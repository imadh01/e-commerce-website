import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./About.css";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function About() {
  // A ref to the page's outer container, so we can search *within* this
  // page only for elements to animate — not query the whole document.
  //   throw new Error("Test crash");
  usePageTitle("About Us");
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ----- 1. Image fade-in on load -----
    const revealImages = Array.from(container.querySelectorAll(".reveal-img"));

    function markLoaded(img) {
      img.classList.add("is-loaded");
    }

    revealImages.forEach((img) => {
      if (img.complete && img.naturalWidth !== 0) {
        markLoaded(img);
      } else {
        img.addEventListener("load", () => markLoaded(img));
        img.addEventListener("error", () => markLoaded(img));
      }
    });

    // ----- 2. Scroll-reveal for headings/paragraphs/image rows -----
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

    // Cleanup: disconnect the observer when the component unmounts
    // (e.g. navigating away to another page), so it doesn't keep
    // watching elements that no longer exist.
    return () => observer.disconnect();
  }, []); // empty dependency array = run once, after the first render

  return (
    <div className="about-page" ref={containerRef}>
      <section className="about-hero">
        <img
          className="reveal-img"
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80"
          alt="Shoppers browsing fresh produce inside a modern grocery store"
        />
      </section>

      <section className="about-content">
        <h1 className="reveal-el">About us</h1>

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
            to the best of our knowledge, believe and representations given to
            us by these third party(ies) this information is not stored.
          </strong>
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

        <div className="image-row two-col reveal-el">
          <div className="row-image">
            <img
              className="reveal-img"
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
              alt="Grocer carrying a crate of fresh fruit in a produce aisle"
            />
          </div>
          <div className="row-image">
            <img
              className="reveal-img"
              src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80"
              alt="Shop owner standing confidently in front of stocked shelves"
            />
          </div>
        </div>

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
          </a>{" "}
          for necessary action.
        </p>

        <div className="image-row three-col reveal-el">
          <div className="row-image">
            <img
              className="reveal-img"
              src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80"
              alt="Woman preparing a fresh meal with vegetables in her kitchen"
            />
          </div>
          <div className="row-image">
            <img
              className="reveal-img"
              src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=600&q=80"
              alt="Family shopping together at a grocery store"
            />
          </div>
          <div className="row-image">
            <img
              className="reveal-img"
              src="https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=600&q=80"
              alt="Woman unpacking fresh groceries at home"
            />
          </div>
        </div>

        <p className="reveal-el">
          Built on a proprietary technology stack, the Grocers platform serves
          as a convergence of consumers looking for everyday essentials, partner
          stores who serve their needs efficiently, and manufacturers looking
          for a channel to reach a nation of consumers. While our technology
          caters to the burgeoning population of urban life, it is ready and
          poised to serve the next 100+ million shoppers who are yet to start
          shopping online.
        </p>

        <p className="reveal-el">
          We believe the ecosystem we power can transform the lives of a billion
          people significantly over the coming decade. They will have access to
          everyday essentials like groceries at the best value, be able to
          discover products that improve their health and wellbeing, and spend
          more meaningful time with their families — with the assurance that
          their essential needs are being looked after by us. On the other side
          of this virtuous cycle are the millions of local businesses catering
          to a nation's needs, helping create more opportunities for employment,
          growth, and above all, a better life.
        </p>

        <div className="image-row single-col reveal-el">
          <div className="row-image">
            <img
              className="reveal-img"
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80"
              alt="Diverse group of people standing together"
            />
          </div>
        </div>

        <h2 className="reveal-el">Be safe, be secure!!</h2>

        <p className="reveal-el">
          Mamluk is leading the charge in transforming the grocery landscape
          through cutting-edge technology and innovation. We believe everyone
          deserves the opportunity to continually improve their life — a process
          that often begins at home. As part of our mission of helping consumers
          make healthier, better choices when buying everyday products, we make
          a wide range of high-quality grocery and household products
          accessible, affordable, and available right at their doorsteps.
        </p>

        <p className="reveal-el">
          <strong>For media enquiries please contact us at:</strong>{" "}
          <a href="mailto:mamluk@mamluk.in" className="inline-link">
            mamluk@mamluk.in
          </a>
          .
        </p>
        <p className="reveal-el">
          For all other inquiries, visit our{" "}
          <Link to="/contact" className="inline-link">
            Contact Us
          </Link>{" "}
          page.
        </p>
      </section>
    </div>
  );
}

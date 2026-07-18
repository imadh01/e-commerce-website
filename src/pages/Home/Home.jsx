import { usePageTitle } from "../../hooks/usePageTitle";
export default function Home() {
  usePageTitle("Home");
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <h1>Home page — coming in a later step</h1>
    </div>
  );
}

const LOGO_URL =
  "https://media.base44.com/images/public/6a30968a62b02031a9cb4377/0257c9d30_UPM_MainLogo_Whitev2300x.png";

export default function Logo({ className = "h-8 w-auto", alt = "Under Par Mindset" }) {
  return <img src={LOGO_URL} alt={alt} className={className} />;
}
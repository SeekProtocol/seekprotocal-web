import Link from "next/link";

export default function NotFound() {
  return (
    <div className="utility-page-wrap">
      <div className="utility-page-content">
        <img
          src="https://d3e54v103j8qbb.cloudfront.net/static/page-not-found.211a85e40c.svg"
          alt="Page not found"
        />
        <h2>Page Not Found</h2>
        <div>The page you are looking for doesn&apos;t exist or has been moved</div>
      </div>
      <div className="_404-page-wrap">
        <div className="_404-image">
          <img
            src="/images/404_1404.avif"
            loading="lazy"
            alt="404"
            className="fit-cover"
          />
        </div>
        <div className="_404-text-wrap">
          <h4 className="h4 text-gray">Oops Page Not Found</h4>
          <div className="_404-button-wrap">
            <Link href="/" className="button-01 w-inline-block">
              <div className="button-text-icon-wrap">
                <div className="button-text-wrapper">
                  <div className="paragraph-02 text-black">Back to Home</div>
                  <div className="paragraph-02 text-black">Back to Home</div>
                </div>
                <div className="button-icon-wrapper">
                  <img
                    src="/images/Button-Icon-1.svg"
                    loading="lazy"
                    alt=""
                    className="button-icon"
                  />
                </div>
              </div>
              <div className="hover-color"></div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

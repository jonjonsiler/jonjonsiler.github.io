import React, { useState } from "react";
import "./accordion.scss";

export const VerticalAccordion = () => {
  const [activeId, setActiveId] = useState("accordion-card-3");
  const handleToggle = (targetId: string) => {
    setActiveId(targetId);
  };

  return (
    <section className="s-accordion">
      <div id="accordion-b6ac9" className="accordion accordion-vertical">
        <article className="accordion-card">
          <button
            className={`accordion-header${
              activeId === "accordion-card-1" ? "" : " collapsed"
            }`}
            type="button"
            onClick={() => handleToggle("accordion-card-1")}
            aria-expanded={activeId === "accordion-card-1"}
            aria-controls="accordion-card-1"
          >
            <h3 id="accordion-header-1">Raw Processing</h3>
            <span className="accordion-toggle"></span>
          </button>
          <div
            id="accordion-card-1"
            className={`accordion-content collapse${
              activeId === "accordion-card-1" ? " show" : ""
            }`}
            aria-labelledby="accordion-header-1"
            data-parent="#accordion-b6ac9"
          >
            <div className="accordion-image">
              <img
                decoding="async"
                width="1600"
                height="1032"
                src="/images/accordion/190701_5301-Aberdeen-clean-ps2-black.jpg"
                className="img-fluid"
                alt=""
                srcSet="/images/accordion/190701_5301-Aberdeen-clean-ps2-black.jpg 1600w, /images/accordion/190701_5301-Aberdeen-clean-ps2-black-300x194.jpg 300w, /images/accordion/190701_5301-Aberdeen-clean-ps2-black-1024x660.jpg 1024w, /images/accordion/190701_5301-Aberdeen-clean-ps2-black-768x495.jpg 768w, /images/accordion/190701_5301-Aberdeen-clean-ps2-black-1536x991.jpg 1536w"
                sizes="(max-width: 1600px) 100vw, 1600px"
              />{" "}
            </div>
            <div className="accordion-body">
              <h4 className="accordion-title">Core Operations Overview</h4>
              <p className="accordion-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.{" "}
              </p>
              <a
                href="#"
                className="btn btn-white"
              >
                Learn More
              </a>
            </div>
          </div>
        </article>
        <article className="accordion-card">
          <button
            className={`accordion-header${
              activeId === "accordion-card-2" ? "" : " collapsed"
            }`}
            type="button"
            onClick={() => handleToggle("accordion-card-2")}
            aria-expanded={activeId === "accordion-card-2"}
            aria-controls="accordion-card-2"
          >
            <h3 id="accordion-header-2">Refined Oil</h3>
            <span className="accordion-toggle"></span>
          </button>
          <div
            id="accordion-card-2"
            className={`accordion-content collapse${
              activeId === "accordion-card-2" ? " show" : ""
            }`}
            aria-labelledby="accordion-header-2"
            data-parent="#accordion-b6ac9"
          >
            <div className="accordion-image">
              <img
                decoding="async"
                width="1500"
                height="1000"
                src="/images/accordion/Plant_SJ_N2_medium-ps.jpg"
                className="img-fluid"
                alt=""
                srcSet="/images/accordion/Plant_SJ_N2_medium-ps.jpg 1500w, /images/accordion/Plant_SJ_N2_medium-ps-300x200.jpg 300w, /images/accordion/Plant_SJ_N2_medium-ps-1024x683.jpg 1024w, /images/accordion/Plant_SJ_N2_medium-ps-768x512.jpg 768w"
                sizes="(max-width: 1500px) 100vw, 1500px"
              />{" "}
            </div>
            <div className="accordion-body">
              <h4 className="accordion-title">
                Refined Products Spotlight
              </h4>
              <p className="accordion-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
                aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint
                occaecat cupidatat non proident.
              </p>
              <a
                href="#"
                className="btn btn-white"
              >
                Learn More
              </a>
            </div>
          </div>
        </article>
        <article className="accordion-card">
          <button
            className={`accordion-header${
              activeId === "accordion-card-3" ? "" : " collapsed"
            }`}
            type="button"
            onClick={() => handleToggle("accordion-card-3")}
            aria-expanded={activeId === "accordion-card-3"}
            aria-controls="accordion-card-3"
          >
            <h3 id="accordion-header-3">Renewable Fuels</h3>
            <span className="accordion-toggle"></span>
          </button>
          <div
            id="accordion-card-3"
            className={`accordion-content collapse${
              activeId === "accordion-card-3" ? " show" : ""
            }`}
            aria-labelledby="accordion-header-3"
            data-parent="#accordion-b6ac9"
          >
            <div className="accordion-image">
              <img
                decoding="async"
                width="1500"
                height="968"
                src="/images/accordion/190710_5430-Algona-crop-ps2-black.jpg"
                className="img-fluid"
                alt=""
                srcSet="/images/accordion/190710_5430-Algona-crop-ps2-black.jpg 1500w, /images/accordion/190710_5430-Algona-crop-ps2-black-300x194.jpg 300w, /images/accordion/190710_5430-Algona-crop-ps2-black-1024x661.jpg 1024w, /images/accordion/190710_5430-Algona-crop-ps2-black-768x496.jpg 768w"
                sizes="(max-width: 1500px) 100vw, 1500px"
              />
            </div>
            <div className="accordion-body">
              <h4 className="accordion-title">
                Renewable Energy Focus
              </h4>
              <p className="accordion-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam.{" "}
              </p>
              <a
                href="#"
                className="btn btn-white"
              >
                Learn More
              </a>
            </div>
          </div>
        </article>
        <article className="accordion-card">
          <button
            className={`accordion-header${
              activeId === "accordion-card-4" ? "" : " collapsed"
            }`}
            type="button"
            onClick={() => handleToggle("accordion-card-4")}
            aria-expanded={activeId === "accordion-card-4"}
            aria-controls="accordion-card-4"
          >
            <h3 id="accordion-header-4">Ag Products</h3>
            <span className="accordion-toggle"></span>
          </button>
          <div
            id="accordion-card-4"
            className={`accordion-content collapse${
              activeId === "accordion-card-4" ? " show" : ""
            }`}
            aria-labelledby="accordion-header-4"
            data-parent="#accordion-b6ac9"
          >
            <div className="accordion-image">
              <img
                decoding="async"
                width="1500"
                height="894"
                src="/images/accordion/DSC04107-flat-port-crop-ps5-black.jpg"
                className="img-fluid"
                alt=""
                srcSet="/images/accordion/DSC04107-flat-port-crop-ps5-black.jpg 1500w, /images/accordion/DSC04107-flat-port-crop-ps5-black-300x179.jpg 300w, /images/accordion/DSC04107-flat-port-crop-ps5-black-1024x610.jpg 1024w, /images/accordion/DSC04107-flat-port-crop-ps5-black-768x458.jpg 768w"
                sizes="(max-width: 1500px) 100vw, 1500px"
              />{" "}
            </div>
            <div className="accordion-body">
              <h4 className="accordion-title">Market Access Highlights</h4>
              <p className="accordion-description">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo
                enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos.
              </p>
              <a
                href="#"
                className="btn btn-white"
              >
                Learn More
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

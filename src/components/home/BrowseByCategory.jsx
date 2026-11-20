import React from "react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Art", icon: "fa-image" },
  { name: "Music", icon: "fa-music" },
  { name: "Domain Names", icon: "fa-search" },
  { name: "Virtual Worlds", icon: "fa-globe" },
  { name: "Trading Cards", icon: "fa-vcard" },
  { name: "Collectibles", icon: "fa-th" },
];

const BrowseByCategory = () => {
  return (
    <section id="section-category" className="no-top">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center" data-aos="fade-up">
              <h2>Browse by category</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="col-md-2 col-sm-4 col-6 mb-sm-30"
              data-aos="fade-up"
              data-aos-delay={index * 50}
            >
              <Link to="/explore" className="icon-box style-2 rounded">
                <i className={`fa ${category.icon}`}></i>
                <span>{category.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategory;

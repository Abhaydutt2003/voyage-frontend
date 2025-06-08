"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useGetAuthUserQuery } from "@/state/api/authEndpoints";

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const [cardHrefs, setCardHrefs] = useState(["/search", "/signup", "/signup"]);

  useEffect(() => {
    if (authUser) {
      setCardHrefs(() => {
        return authUser.userRole?.toLowerCase() === "tenant"
          ? ["/search", "/tenants/favorites", "/tenants/favorites"]
          : ["/search", "/managers/properties", "/managers/properties"];
      });
    }
  }, [authUser]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-24 px-6 sm:px-8 lg:px-12 xl:px-16  flex items-center justify-center"
    >
      <div className=" max-w-4xl xl:max-w-6xl max-auto flex flex-col items-center">
        <motion.h2
          variants={itemVariants}
          className=" text-3xl font-bold text-center mb-12 w-full sm:w-2/3 max-auto"
        >
          Your Complete Rental Journey, Simplified
        </motion.h2>
        <div className=" grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
          {[0, 1, 2].map((index) => (
            <motion.div key={index}>
              <FeatureCard
                imageSrc={`/landing-search${3 - index}.png`}
                title={
                  [
                    "Smart Property Search",
                    "Streamlined Application Process",
                    "Complete Rental Management",
                  ][index]
                }
                description={
                  [
                    "Find your perfect rental with our advanced search filters and location-based property discovery.",
                    "Submit applications seamlessly and track their status in real-time with our intuitive system.",
                    "Manage your rental journey from application to lease with our comprehensive platform.",
                  ][index]
                }
                linkText={
                  ["Find Properties", "Apply Now", "Manage Rentals"][index]
                }
                linkHref={cardHrefs[index]}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard = ({
  imageSrc,
  title,
  description,
  linkText,
  linkHref,
}: {
  imageSrc: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}) => (
  <div className="text-center">
    <div className=" p-4 rounded-lg mb-4 flex items-center justify-center h-48">
      <Image
        alt={title}
        src={imageSrc}
        width={400}
        height={400}
        className=" w-full h-full object-contain"
      />
    </div>
    <h3 className=" text-xl font-semibold mb-2">{title}</h3>
    <p className="mb-4">{description}</p>
    <Link
      href={linkHref}
      className=" inline-block border border-gray-300 rounded px-4 py-2 hover:bg-gray-100"
      scroll={false}
    >
      {linkText}
    </Link>
  </div>
);

export default FeaturesSection;

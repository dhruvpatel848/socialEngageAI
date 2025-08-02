import React from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import Image from 'next/image';

export default function About() {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-Founder',
      bio: 'Former social media director with 10+ years of experience working with major brands. Sarah leads our company vision and strategy.',
      imagePath: '/images/team/sarah.svg'
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-Founder',
      bio: 'AI researcher with a PhD in Machine Learning. Michael oversees our prediction algorithms and technical infrastructure.',
      imagePath: '/images/team/michael.svg'
    },
    {
      name: 'Priya Patel',
      role: 'Head of Data Science',
      bio: 'Data scientist with expertise in NLP and engagement prediction models. Priya leads our research team in developing cutting-edge algorithms.',
      imagePath: '/images/team/priya.svg'
    },
    {
      name: 'James Wilson',
      role: 'Head of Product',
      bio: 'Product manager with experience at leading tech companies. James ensures our platform meets the needs of content creators and marketers.',
      imagePath: '/images/team/james.svg'
    }
  ];

  return (
    <Layout title="About Us">
      <div className="bg-white">
        {/* Hero section */}
        <div className="relative bg-primary-700">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-primary-600 mix-blend-multiply" aria-hidden="true" />
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About Us</h1>
            <p className="mt-6 max-w-3xl text-xl text-primary-100">
              We're on a mission to help content creators and social media managers make data-driven decisions
              that maximize engagement and grow their audience.
            </p>
          </div>
        </div>

        {/* Our Story section */}
        <div className="relative py-16 bg-white overflow-hidden">
          <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
            <div className="relative h-full text-lg max-w-prose mx-auto" aria-hidden="true">
              <svg
                className="absolute top-12 left-full transform translate-x-32"
                width={404}
                height={384}
                fill="none"
                viewBox="0 0 404 384"
              >
                <defs>
                  <pattern
                    id="74b3fd99-0a6f-4271-bef2-e80eeafdf357"
                    x={0}
                    y={0}
                    width={20}
                    height={20}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect x={0} y={0} width={4} height={4} className="text-primary-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width={404} height={384} fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)" />
              </svg>
              <svg
                className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32"
                width={404}
                height={384}
                fill="none"
                viewBox="0 0 404 384"
              >
                <defs>
                  <pattern
                    id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                    x={0}
                    y={0}
                    width={20}
                    height={20}
                    patternUnits="userSpaceOnUse"
                  >
                    <rect x={0} y={0} width={4} height={4} className="text-primary-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width={404} height={384} fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
              </svg>
            </div>
          </div>
          <div className="relative px-4 sm:px-6 lg:px-8">
            <div className="text-lg max-w-prose mx-auto">
              <h2>
                <span className="block text-base text-center text-primary-600 font-semibold tracking-wide uppercase">
                  Our Story
                </span>
                <span className="mt-2 block text-3xl text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                  From Frustration to Innovation
                </span>
              </h2>
              <p className="mt-8 text-xl text-gray-500 leading-8">
                Social Media Analytics Platform was born out of frustration. As content creators ourselves, we were tired of the guesswork involved in social media marketing. We wanted to know which posts would perform well before we published them.
              </p>
            </div>
            <div className="mt-6 prose prose-primary prose-lg text-gray-500 mx-auto">
              <p>
                In 2020, our founders Sarah Johnson and Michael Chen combined their expertise in social media marketing and machine learning to create a solution. They built the first prototype of our prediction algorithm, which could forecast engagement with surprising accuracy.
              </p>
              <p>
                What started as a tool for their own use quickly gained attention from fellow marketers and content creators. After six months of development and testing with a small group of beta users, we officially launched our platform in early 2021.
              </p>
              <p>
                Today, we serve thousands of users across the globe, from individual content creators to enterprise marketing teams. Our prediction models have evolved to incorporate the latest advances in AI and machine learning, and our platform continues to expand with new features and insights.
              </p>
              <h3>Our Values</h3>
              <ul>
                <li>
                  <strong>Data-Driven Decisions:</strong> We believe that the best content strategies are built on solid data, not hunches.
                </li>
                <li>
                  <strong>Continuous Improvement:</strong> Our algorithms and platform are constantly evolving to provide more accurate predictions and deeper insights.
                </li>
                <li>
                  <strong>User Privacy:</strong> We're committed to responsible data practices and transparent privacy policies.
                </li>
                <li>
                  <strong>Accessibility:</strong> We strive to make advanced analytics accessible to creators of all sizes, not just big brands with big budgets.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team section */}
        <div className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Meet our team</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                We're a diverse group of experts passionate about helping content creators succeed through data-driven insights.
              </p>
            </div>
            <ul
              role="list"
              className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
            >
              {teamMembers.map((person) => (
                <li key={person.name} className="text-center">
                  <div className="mx-auto h-56 w-56 relative">
                    <div className="h-full w-full rounded-full overflow-hidden bg-primary-100 flex items-center justify-center text-primary-800 text-6xl">
                      {/* Placeholder for actual images */}
                      {person.name.charAt(0)}
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-7 tracking-tight text-gray-900">{person.name}</h3>
                  <p className="text-sm leading-6 text-primary-600">{person.role}</p>
                  <p className="mt-4 text-base leading-7 text-gray-600">{person.bio}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-primary-700">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to boost your social media performance?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-200">
                Join thousands of content creators who are using data-driven insights to grow their audience and increase engagement.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/register">
                  <a className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    Get started
                  </a>
                </Link>
                <Link href="/contact">
                  <a className="text-sm font-semibold leading-6 text-white">
                    Contact us <span aria-hidden="true">→</span>
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
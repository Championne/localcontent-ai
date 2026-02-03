import React from 'react';

const AboutPage = () => {
  return (
    <div className='container mx-auto px-4 py-12'>
      <h1 className='text-4xl font-bold text-center text-gray-900 mb-8'>
        Empowering local businesses to dominate their market
      </h1>

      <div className='max-w-3xl mx-auto text-lg text-gray-700 space-y-6'>
        <p>
          GeoSpark is dedicated to transforming how local businesses engage with their communities.
          Our mission is to empower local businesses to dominate their market through AI-generated,
          locally-optimized content that drives traffic, engagement, and sales. We combine cutting-edge AI
          with a deep understanding of local nuances to provide content that truly resonates.
        </p>

        <h2 className='text-3xl font-semibold text-teal-600 mb-4'>Our Values</h2>
        <ul className='list-disc list-inside space-y-2 text-gray-700'>
          <li>
            <span className='font-medium text-teal-600'>Local Empowerment:</span> A deep commitment to the success and sustainability of local businesses and communities.
          </li>
          <li>
            <span className='font-medium text-teal-600'>Intelligent Simplicity:</span> Delivering sophisticated AI technology in an intuitive, easy-to-use platform.
          </li>
          <li>
            <span className='font-medium text-teal-600'>Authentic Connection:</span> Valuing content that genuinely resonates with local audiences and strengthens community ties.
          </li>
        </ul>

        <h2 className='text-3xl font-semibold text-teal-600 mb-4'>Our Vision</h2>
        <p>
          To become the go-to content automation platform for 10,000+ local businesses by Year 2,
          fostering vibrant local economies by enabling every business to effectively tell its unique local story.
        </p>

        <div className='text-center mt-10'>
          <a 
            href='/auth/signup' 
            className='inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors'
          >
            Get Started Free
          </a>
         </div>
      </div>
    </div>
  );
};

export default AboutPage;

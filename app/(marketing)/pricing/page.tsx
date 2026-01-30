
// app/(marketing)/pricing/page.tsx

import React from 'react';

const PricingPage = () => {
  return (
    <div className='min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            Flexible Pricing for Every Business
          </h2>
          <p className='mt-4 text-xl text-gray-600'>
            Choose the plan that suits your needs best, from startups to enterprises.
          </p>
        </div>

        <div className='mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Basic Tier */}
          <div className='bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200'>
            <div className='p-6'>
              <h2 className='text-lg leading-6 font-medium text-gray-900'>Basic</h2>
              <p className='mt-4 text-sm text-gray-500'>
                Perfect for individuals and small teams getting started.
              </p>
              <p className='mt-8'>
                <span className='text-4xl font-extrabold text-gray-900'>$19</span>{' '}
                <span className='text-base font-medium text-gray-500'>/month</span>
              </p>
              <a
                href='#'
                className='mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700'
              >
                Start your 7-day free trial
              </a>
            </div>
            <div className='pt-6 pb-8 px-6'>
              <h3 className='text-xs font-medium text-gray-900 tracking-wide uppercase'>
                What's included
              </h3>
              <ul role='list' className='mt-6 space-y-4'>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Up to 5 users</span>
                </li>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Basic analytics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tier */}
          <div className='bg-white border-2 border-indigo-600 rounded-lg shadow-sm divide-y divide-gray-200 transform scale-105'>
            <div className='p-6'>
              <h2 className='text-lg leading-6 font-medium text-gray-900'>Pro</h2>
              <p className='mt-4 text-sm text-gray-500'>
                For growing businesses needing advanced features and support.
              </p>
              <p className='mt-8'>
                <span className='text-4xl font-extrabold text-gray-900'>$49</span>{' '}
                <span className='text-base font-medium text-gray-500'>/month</span>
              </p>
              <a
                href='#'
                className='mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700'
              >
                Start your 7-day free trial
              </a>
            </div>
            <div className='pt-6 pb-8 px-6'>
              <h3 className='text-xs font-medium text-gray-900 tracking-wide uppercase'>
                What's included
              </h3>
              <ul role='list' className='mt-6 space-y-4'>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Up to 20 users</span>
                </li>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Advanced analytics</span>
                </li>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Priority support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className='bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200'>
            <div className='p-6'>
              <h2 className='text-lg leading-6 font-medium text-gray-900'>Enterprise</h2>
              <p className='mt-4 text-sm text-gray-500'>
                For large organizations needing custom solutions and dedicated support.
              </p>
              <p className='mt-8'>
                <span className='text-4xl font-extrabold text-gray-900'>Custom</span>{' '}
                <span className='text-base font-medium text-gray-500'>/month</span>
              </p>
              <a
                href='#'
                className='mt-8 block w-full bg-gray-800 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-gray-900'
              >
                Contact Us
              </a>
            </div>
            <div className='pt-6 pb-8 px-6'>
              <h3 className='text-xs font-medium text-gray-900 tracking-wide uppercase'>
                What's included
              </h3>
              <ul role='list' className='mt-6 space-y-4'>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Unlimited users</span>
                </li>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Custom analytics & reporting</span>
                </li>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>Dedicated account manager</span>
                </li>
                <li className='flex space-x-3'>
                  <svg
                    className='flex-shrink-0 h-5 w-5 text-green-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm text-gray-500'>SLA with 24/7 support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

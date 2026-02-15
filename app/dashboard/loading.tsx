export default function Loading() {
  return (
    <div className='flex flex-col space-y-3'>
      <div className='h-6 bg-gray-300 rounded w-1/4'></div>
      <div className='space-y-2'>
        <div className='h-4 bg-gray-300 rounded'></div>
        <div className='h-4 bg-gray-300 rounded w-5/6'></div>
      </div>
      <div className='h-40 bg-gray-300 rounded'></div>
      <div className='h-10 bg-gray-300 rounded w-1/2'></div>
    </div>
  );
}

import '@/styles/polkadot.css';

interface IDefault {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

function Default({ children, sidebar }: IDefault) {
  return (
    <div className='grid h-screen grid-cols-[25rem_auto]'>
      <aside className='border-r border-gray-300 bg-gray-50 relative'>
        {sidebar}
      </aside>
      <main className='polkadot'>{children}</main>
    </div>
  );
}

export default Default;

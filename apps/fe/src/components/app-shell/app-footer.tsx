import InstagramIcon from '@/assets/svg/instagram-icon'
import ThreadsIcon from '@/assets/svg/threads-icon'

export function AppFooter() {
  return (
    <div className='text-muted-foreground flex w-full items-center justify-between gap-3 px-3 py-2 max-sm:flex-col sm:gap-6 sm:px-4'>
      <p className='text-sm text-balance max-sm:text-center'>
        {`©${new Date().getFullYear()}`}{' '}
        <a href='https://moccilabs.com' target='_blank' rel='noopener noreferrer' className='text-primary'>
          moccilabs
        </a>
        , Made for better web design
      </p>
      <div className='text-muted-foreground *:hover:text-primary flex items-center gap-5'>
        <a
          href='https://instagram.com/moccilabs'
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Instagram @moccilabs'
        >
          <InstagramIcon className='size-4' />
        </a>
        <a
          href='https://www.threads.net/@moccilabs'
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Threads @moccilabs'
        >
          <ThreadsIcon className='size-4' />
        </a>
      </div>
    </div>
  )
}

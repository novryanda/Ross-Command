import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PageHeader, Showcase, ShowcaseGrid } from '@/components/showcase'
import { avatarSrc } from '@/lib/assets'

export default function AvatarPage() {
  return (
    <div className='space-y-8'>
      <PageHeader title='Avatar' description='An image element with a fallback for representing the user.' />
      <ShowcaseGrid>
        <Showcase title='Sizes'>
          <Avatar size='sm'>
            <AvatarImage src={avatarSrc(1)} />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src={avatarSrc(2)} />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <Avatar size='lg'>
            <AvatarImage src={avatarSrc(3)} />
            <AvatarFallback>LG</AvatarFallback>
          </Avatar>
        </Showcase>
        <Showcase title='Fallback'>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback className='bg-primary/10 text-primary'>MA</AvatarFallback>
          </Avatar>
        </Showcase>
      </ShowcaseGrid>
    </div>
  )
}

import { UserIcon } from 'lucide-react'
import React from 'react'
import Link from "next/link";
import { Button } from './ui/button'
import { currentUser } from '@clerk/nextjs/server';

async function ProfileButton() {
    const user = await currentUser();
  return (
    <Button variant="ghost" className="flex items-center gap-3 justify-start" asChild>
        <Link href={`/profile/${
                user?.username ?? user?.emailAddresses[0].emailAddress.split("@")[0]
              }`}>
            <UserIcon className="w-4 h-4" />
                Profile
        </Link>
    </Button>
  )
}

export default ProfileButton;
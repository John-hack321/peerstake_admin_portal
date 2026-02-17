'use client'
import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function Home() {

  const router= useRouter()
  useEffect(()=> {
    const redirectAdmin= ()=> {
      router.push('/login')
    };

    redirectAdmin();
  },[])

  return (
    <div>
      this is the home page
    </div>
  );
}

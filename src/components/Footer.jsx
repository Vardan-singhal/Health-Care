import React from 'react'


export default function Footer(){
return (
<footer className="bg-light text-center py-3 mt-auto">
<div className="container">© {new Date().getFullYear()} HealLink</div>
</footer>
)
}
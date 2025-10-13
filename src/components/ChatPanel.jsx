import React, { useState } from 'react'


export default function ChatPanel({ thread = [], onSend }){
const [text, setText] = useState('')
const send = () => { if(!text.trim()) return; onSend(text); setText('') }
return (
<div className="border rounded p-2 d-flex flex-column" style={{height: '400px'}}>
<div style={{overflowY:'auto', flex:1}}>
{thread.map((m,i) => (
<div key={i} className={`mb-2 ${m.from === 'me' ? 'text-end' : ''}`}>
<div className={`d-inline-block p-2 rounded ${m.from === 'me' ? 'bg-primary text-white' : 'bg-light'}`}>{m.text}</div>
</div>
))}
</div>
<div className="mt-2 d-flex">
<input className="form-control me-2" value={text} onChange={e=>setText(e.target.value)} />
<button className="btn btn-primary" onClick={send}>Send</button>
</div>
</div>
)
}
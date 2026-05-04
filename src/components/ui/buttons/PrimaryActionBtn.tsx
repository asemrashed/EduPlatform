import React from 'react'

function PrimaryActionBtn({handleBtn, value}: {handleBtn: () => void, value: string}) {
  return (
    <button
        type="button"
        onClick={handleBtn}
        className="my-2 w-full px-3 md:px-5 rounded-lg cursor-pointer bg-gradient-to-b from-primary to-primary/60 hover:to-primary/80 py-1.5 md:py-3 text-center font-bold text-on-primary hover:shadow-lg shadow-blue-900/20 transition duration-300"
        >
        {value}
    </button>
  )
}

export default PrimaryActionBtn
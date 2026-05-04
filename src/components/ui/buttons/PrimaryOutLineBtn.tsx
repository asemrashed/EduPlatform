import React from 'react'

function PrimaryOutLineBtn({handleBtn, value}: {handleBtn: () => void, value: string}) {
  return (
    <button
        type="button"
        onClick={handleBtn}
        className="my-2 w-full px-3 md:px-5 rounded-lg cursor-pointer border border-primary text-primary hover:bg-linear-to-bl hover:from-primary hover:to-primary/60 hover:text-on-primary py-1.5 md:py-3 text-center font-bold hover:shadow-lg shadow-blue-900/20 transition duration-300"
        >
        {value}
    </button>
  )
}

export default PrimaryOutLineBtn
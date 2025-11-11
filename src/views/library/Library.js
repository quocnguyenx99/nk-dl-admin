import React from 'react'

const CKFinderFrame = ({
  src = 'https://ad.chinhnhan.vn/ckfinder/ckfinder.html',
  height = '600px',
}) => {
  return (
    <iframe
      src={src}
      title="CKFinder"
      style={{
        width: '100%',
        height: height,
        border: 'none',
      }}
    />
  )
}

export default CKFinderFrame

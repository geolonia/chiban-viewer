import React from 'react'

interface Props {
  className: string;
}

const Component = (props: Props) => {

  const style = {
  }

  return (
    <div className={props.className}>
      <div style={style}>
        <div>
          <p style={{ fontSize: '144px', margin: 0, lineHeight: '144px' }}>Loading ...</p>
        </div>
      </div>
    </div>
  );
}

export default Component;

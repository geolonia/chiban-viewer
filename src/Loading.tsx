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
          <p>地図 XML をロードしています ...</p>
        </div>
      </div>
    </div>
  );
}

export default Component;

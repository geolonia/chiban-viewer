import React from 'react'
import classNames from 'classnames';
import { useAtomValue } from 'jotai';
import { loadingAtom } from './atoms';

const Component: React.FC = () => {
  const loading = useAtomValue(loadingAtom);

  return (
    <div className={classNames('loading', { 'done': !loading } )}>
      <div>
        <div>
          <p>地図 XML をロードしています ...</p>
        </div>
      </div>
    </div>
  );
}

export default Component;

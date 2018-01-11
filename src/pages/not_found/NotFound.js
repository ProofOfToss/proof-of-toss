'use strict';

import React from 'react';
import { strings } from '../../util/i18n';

class NotFound extends React.Component {
    render() {
        return (
          <main className="container">
            <div>
              <h1>{strings().notfound.error}</h1>
              <p>{strings().notfound.message}</p>
            </div>
          </main>
        );
    }
};

export default NotFound

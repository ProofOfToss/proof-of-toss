'use strict';

import React from 'react';
import { strings } from '../../util/i18n';

class NotFound extends React.Component {
    render() {
        return (
          <div className="Page">
            <main className="container">
              <div className="pure-g">
                <div className="pure-u-1-1">
                  <h1>{strings().notfound.error}</h1>
                  <p>{strings().notfound.message}</p>
                </div>
              </div>
            </main>
          </div>
        );
    }
};

export default NotFound

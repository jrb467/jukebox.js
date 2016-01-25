import React from 'react';
import ReactDOM from 'react-dom';

import Parent from './parent.jsx';

ReactDOM.render(
    <Parent />
    ,
    document.getElementById("container")
);

/* TODO if the tabs are ever replaced and rerendered, they won't work anymore
 * possibly move this into mounting behavior for the upload pane (componentDidMount)
 */
$('.tabular.menu .item').tab();

import { useEffect, useState } from 'react';

import { useSession, REACT_APP_API_HOST } from '../modules/sessionmanager';

import Screen from '../pages/Screen'
import FooterRow from '../components/FooterRow'
import { makeStatusData }  from '../modules/App';
import { cents2EU }  from '../modules/money';

import { D_Page } from '../modules/terms.js'

export default function Welcome() {
    return (        
        <div id='mainPage' class="dosBorder">
            <h1 id="SignUp">Sign Up</h1>CSV/JSON in UTF-8
            <div  class="mTable"  >
                <div  class="attrRow"  >
                    <div class="FIELD LNAM" ondragover="dragOverHandler" ondrop="dropHandler"> </div>
                        <div class="key" id="fileupload">Upload</div>            
                    </div>
                </div>
         </div>
        
        
    )
}

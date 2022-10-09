export default function Screen({ children }) {
    return (
            <div class="mTable">

                <div class="attrRow">
                    <div class="key" onClick={select('PageContent',-1)}>Print</div>
                    <div class="key" onClick={select('PageContent',0)}><label class="form-control"><input type="radio" autoFocus="" />0</label></div>
                </div>

                <div class="ulliTab" id="PageContent0" style={{ display: 'block' }}>
                    {children}
                </div>
            </div>
    )
}

function select(target,num) {

    let eHistory = document.getElementById(target+num);
    var screen=eHistory;
    var style="none";
    
    if(!eHistory) { 
        screen=document.getElementById(target+'0'); 
        style="block"; 
        document.getElementById('windowBorder').className="witBorder"; 
    } 
    
    for(var i=0;screen;i++) {
        screen.style.display=style;
        screen=document.getElementById(target+i);
    }
    if(eHistory) {
        eHistory.style.display="block";
        document.getElementById('windowBorder').className="dosBorder"; 
    }
}

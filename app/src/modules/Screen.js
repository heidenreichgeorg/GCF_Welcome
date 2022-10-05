export default function Screen({ children }) {
    return (
            <div class="mTable">

                <div class="attrRow">
                    <div class="key" onclick="select('PageContent',-1)">Print</div>
                    <div class="key" onclick="select('PageContent',0)"><label class="form-control"><input type="radio" autoFocus="" />0</label></div>
                </div>

                <div class="ulliTab" id="PageContent0" style={{ display: 'block' }}>
                    {children}
                </div>
            </div>
    )
}
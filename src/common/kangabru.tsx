import * as React from 'react';

function KangabruTag() {
    return <div className="shadow-lg">
        <a href="https://kangabru.xyz/" target="_blank"
            className="fixed text-white font-bold bg-red-500 flex flex-row border-orange-400 focus:shadow-outline hover:shadow-outline justify-center items-center p-2 sm:p-3 rounded-t z-50 select-none"
            style={{ bottom: 0, right: 50 }}>
            <Logo className="h-4 sm:h-6 mr-2" />
            <span className="text-sm sm:text-base">Kangabru</span>
        </a>
    </div>
}

function Logo(props: { className?: string }) {
    return <svg version="1.1" xmlns="http://www.w3.org/2000/svg" className={props.className}
        xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 374.3 323.5">
        <path fill="#FFB84D" d="M249.8,35.7c-10.4,13-15.7,30.4-18.3,45.7c-15.1-6.3-31.3-8.1-44.4-8.1s-29.4,1.8-44.4,8.1
            	c-2.6-15.3-7.8-32.7-18.3-45.7C95.1-1,31.4,2.6,0,0c0,0,1,83,41,109.2c21,13.8,43.8,12.9,61.1,16c-7.5,30.5,11,66.9,21.1,90.1
            	c20.7,47.6,16,108.2,63.9,108.2c48,0,43.2-60.6,63.9-108.2c10.1-23.2,28.6-59.6,21.1-90.1c17.3-3.1,40.1-2.2,61.1-16
            	C373.3,83,374.3,0,374.3,0C342.9,2.6,279.2-0.9,249.8,35.7z" />
        <path fill="#FF9A00" d="M374.3,0c0,0-1,83-41,109.2c-21,13.8-43.8,13-61.1,16c7.5,30.5-11,66.9-21.1,90.1
            	c-13.7,31.5-16.3,68.7-30.3,90.3c-6.9,10.5-16.4,17.3-31.4,17.9c-0.4,0-0.7,0-1.1,0c-0.3,0-0.7,0-1,0h-0.1V73.3
            	c13.1,0,29.4,1.8,44.4,8.1c2.6-15.3,7.8-32.7,18.3-45.7C279.2-0.9,342.9,2.6,374.3,0z" />
        <path fill="#FFE670" d="M243.2,87.3c9.5,5.9,17.9,14,24.1,25.2c0.7,1.4,1.4,2.7,2,4.1c7.3-1.7,17.2-4,29-6.8
            	c39.5-9.4,47.8-46.9,52.9-81C351.2,28.9,258.3,13.6,243.2,87.3z" />
        <path fill="#FFED97" d="M131.1,87.3c-15.1-73.8-108-58.4-108-58.4c5.1,34,13.4,71.6,52.9,81c11.7,2.8,21.7,5.1,29,6.8
            	c0.6-1.4,1.3-2.8,2-4.1C113.2,101.3,121.6,93.2,131.1,87.3z" />
        <path fill="#FFED97" d="M211.7,238.6c-16.6-21.8,1-66.2-24.4-66.2s-8.2,44.5-24.8,66.2c-16.4,21.5-27.3,84.9,24.8,84.9
            	S228.1,260.1,211.7,238.6z" />
        <path fill="#FFE670"
            d="M220.8,305.6c-5.1,10.1-14.9,17.3-31.4,17.9c-0.4,0-0.7,0-1.1,0c-0.3,0-0.7,0-1,0h-0.1V172.4h0.1
            	c24.1,0,9.6,39.7,22,62.4c0.7,1.3,1.5,2.6,2.4,3.8c1.9,2.6,3.8,5.7,5.5,9.3C225,264.1,229.2,288.8,220.8,305.6z" />
        <path fill="#57555C" d="M187,230.5c-21.6,0-36.3,7.7-27.7,27.5c6.7,15.3,13,21,20.6,22.7v21h14v-21c7.6-1.8,13.9-7.4,20.6-22.7
            	C223.3,238.2,208.6,230.5,187,230.5z" />
        <path fill="#2A2A2C" d="M217.2,247.9c-0.1,2.9-0.9,6.3-2.5,10.1c-6.7,15.3-13,21-20.6,22.7v21h-6.9v-71.2c8.9,0,16.7,1.4,22.1,4.3
            	C214.3,237.6,217.3,241.9,217.2,247.9z" />
        <path fill="#2A2A2C" fillRule="evenodd" clipRule="evenodd" d="M249.9,135c-10.4,0-53.8,0-62.1,0c0,0-0.5,0-1.4,0c-8.3,0-51.6,0-62.1,0c-58.1,0-52,35.3-52,46.7
            	c0,13.5,11.5,43.6,40.7,43.6s64.2-26.7,64.2-63.5c0-7.2,1.1-14.5,9.8-14.6c8.8,0.1,9.8,7.4,9.8,14.6c0,36.8,35,63.5,64.2,63.5
            	s40.7-30.1,40.7-43.6C301.9,170.3,308,135,249.9,135z M198.7,151.3c0-1.9-1.6-6.6-9-7.7c-0.5-0.1-1-0.2-1.4-0.2s-0.8,0-1.2,0
            	s-0.8,0-1.2,0s-0.9,0.1-1.4,0.2c-7.4,1.1-9,5.8-9,7.7c0-5.2-8.8-10.8-17-10.8c3,0.1,20.6-0.2,28.5-0.2c7.9,0.1,25.5,0.3,28.5,0.2
            	C207.5,140.5,198.7,146.1,198.7,151.3z" />
    </svg>
}

export default KangabruTag
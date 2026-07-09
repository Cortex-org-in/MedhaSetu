import React from 'react';

/**
 * Mascot Component for MedhaSetu
 * Renders the robot mascot in 4 different states:
 * - 'static': Still, no animation
 * - 'idle': Subtle floating up and down (ideal for dashboard, profile)
 * - 'wave': Waving hand animation (ideal for greetings, welcome page, signup/login)
 * - 'loading': floating, glowing circuits, blinking loader dots (ideal for loading screens)
 */
export default function Mascot({ state = 'idle', width = '100%', height = '100%', style = {}, className = '' }) {
  // Common shadow filter definition
  const shadowFilter = (
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.15" />
    </filter>
  );

  // Common robot head elements
  const robotHead = (
    <>
      <rect x="310" y="150" width="80" height="80" rx="22" fill="#59748C" stroke="#485D6F" strokeWidth="6"/>
      <circle cx="350" cy="190" r="28" fill="#273849"/>
      <path d="M 350 168 Q 350 182 336 182 Q 350 182 350 196 Q 350 182 364 182 Q 350 182 350 168 Z" fill="white"/>
      <circle cx="366" cy="204" r="5" fill="white"/>

      <rect x="610" y="150" width="80" height="80" rx="22" fill="#59748C" stroke="#485D6F" strokeWidth="6"/>
      <circle cx="650" cy="190" r="28" fill="#273849"/>
      <path d="M 650 168 Q 650 182 636 182 Q 650 182 650 196 Q 650 182 664 182 Q 650 182 650 168 Z" fill="white"/>
      <circle cx="666" cy="204" r="5" fill="white"/>

      <path d="M 485 260 Q 500 275 515 260" fill="none" stroke="#485D6F" strokeWidth="5" strokeLinecap="round"/>
    </>
  );

  if (state === 'static') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width={width} height={height} style={style} className={className}>
        <defs>{shadowFilter}</defs>
        <path d="M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z" fill="#799CBB" stroke="#485D6F" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" filter="url(#shadow)" />
        <g fill="none" stroke="#D2A782" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 270 110 L 270 140 L 300 170" />
          <path d="M 470 110 L 450 130 L 370 130" />
          <path d="M 730 110 L 730 140 L 700 170" />
          <path d="M 590 110 L 610 130 L 630 130" />
          <path d="M 110 250 L 230 250 L 270 290 L 320 290" />
          <path d="M 110 290 L 210 290 L 250 340 L 250 370" />
          <path d="M 890 250 L 770 250 L 730 290 L 680 290" />
          <path d="M 890 290 L 790 290 L 750 340 L 750 370" />
          <path d="M 285 500 L 285 410 L 315 380 L 345 380" />
          <path d="M 395 500 L 395 430 L 435 390 L 490 390" />
          <path d="M 715 500 L 715 410 L 685 380 L 655 380" />
          <path d="M 605 500 L 605 430 L 565 390 L 510 390" />
        </g>
        {robotHead}
      </svg>
    );
  }

  if (state === 'idle') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width={width} height={height} style={style} className={className}>
        <defs>
          {shadowFilter}
          <style>{`
            @keyframes gameIdle {
              0%, 100% {
                transform: translateY(0px) scale(1, 1);
              }
              50% {
                transform: translateY(6px) scale(1.02, 0.97);
              }
            }
            .character-root {
              animation: gameIdle 2.5s ease-in-out infinite;
              transform-origin: 500px 300px;
            }
          `}</style>
        </defs>
        <g className="character-root">
          <path d="M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z" fill="#799CBB" stroke="#485D6F" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" filter="url(#shadow)" />
          <g fill="none" stroke="#D2A782" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 270 110 L 270 140 L 300 170" />
            <path d="M 470 110 L 450 130 L 370 130" />
            <path d="M 730 110 L 730 140 L 700 170" />
            <path d="M 590 110 L 610 130 L 630 130" />
            <path d="M 110 250 L 230 250 L 270 290 L 320 290" />
            <path d="M 110 290 L 210 290 L 250 340 L 250 370" />
            <path d="M 890 250 L 770 250 L 730 290 L 680 290" />
            <path d="M 890 290 L 790 290 L 750 340 L 750 370" />
            <path d="M 285 500 L 285 410 L 315 380 L 345 380" />
            <path d="M 395 500 L 395 430 L 435 390 L 490 390" />
            <path d="M 715 500 L 715 410 L 685 380 L 655 380" />
            <path d="M 605 500 L 605 430 L 565 390 L 510 390" />
          </g>
          {robotHead}
        </g>
      </svg>
    );
  }

  if (state === 'wave') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width={width} height={height} style={style} className={className}>
        <defs>
          {shadowFilter}
          <style>{`
            @keyframes gameIdle {
              0%, 100% {
                transform: translateY(0px) scale(1, 1);
              }
              50% {
                transform: translateY(6px) scale(1.02, 0.97);
              }
            }
            .character-root {
              animation: gameIdle 2.5s ease-in-out infinite;
              transform-origin: 500px 300px;
            }
          `}</style>
        </defs>
        <g className="character-root">
          <path fill="#799CBB" stroke="#485D6F" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" filter="url(#shadow)">
            <animate attributeName="d" 
                     dur="5s" 
                     repeatCount="indefinite"
                     keyTimes="0; 0.04; 0.1; 0.16; 0.22; 0.28; 0.35; 1"
                     values="
                       M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 850 100 L 870 200 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 880 120 L 890 220 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 850 100 L 870 200 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 880 120 L 890 220 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z;
                       M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z"
                     calcMode="spline"
                     keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"/>
          </path>

          <g fill="none" stroke="#D2A782" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 270 110 L 270 140 L 300 170" />
            <path d="M 470 110 L 450 130 L 370 130" />
            <path d="M 730 110 L 730 140 L 700 170" />
            <path d="M 590 110 L 610 130 L 630 130" />
            <path d="M 110 250 L 230 250 L 270 290 L 320 290" />
            <path d="M 110 290 L 210 290 L 250 340 L 250 370" />
            <path d="M 285 500 L 285 410 L 315 380 L 345 380" />
            <path d="M 395 500 L 395 430 L 435 390 L 490 390" />
            <path d="M 715 500 L 715 410 L 685 380 L 655 380" />
            <path d="M 605 500 L 605 430 L 565 390 L 510 390" />

            <path>
              <animate attributeName="d" dur="5s" repeatCount="indefinite"
                       keyTimes="0; 0.04; 0.1; 0.16; 0.22; 0.28; 0.35; 1"
                       values="
                         M 890 250 L 770 250 L 730 290 L 680 290;
                         M 890 250 L 770 250 L 730 290 L 680 290;
                         M 840 130 L 765 210 L 730 290 L 680 290;
                         M 873 150 L 765 207 L 730 290 L 680 290;
                         M 840 130 L 765 210 L 730 290 L 680 290;
                         M 873 150 L 765 207 L 730 290 L 680 290;
                         M 890 250 L 770 250 L 730 290 L 680 290;
                         M 890 250 L 770 250 L 730 290 L 680 290"
                       calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"/>
            </path>

            <path>
              <animate attributeName="d" dur="5s" repeatCount="indefinite"
                       keyTimes="0; 0.04; 0.1; 0.16; 0.22; 0.28; 0.35; 1"
                       values="
                         M 890 290 L 790 290 L 750 340 L 750 370;
                         M 890 290 L 790 290 L 750 340 L 750 370;
                         M 854 170 L 780 290 L 750 340 L 750 370;
                         M 877 190 L 782 296 L 750 340 L 750 370;
                         M 854 170 L 780 290 L 750 340 L 750 370;
                         M 877 190 L 782 296 L 750 340 L 750 370;
                         M 890 290 L 790 290 L 750 340 L 750 370;
                         M 890 290 L 790 290 L 750 340 L 750 370"
                       calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1"/>
            </path>
          </g>
          {robotHead}
        </g>
      </svg>
    );
  }

  if (state === 'loading') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width={width} height={height} style={style} className={className}>
        <defs>
          {shadowFilter}
          <style>{`
            /* Hovering Animation */
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-30px); }
            }
            
            /* Ground Shadow Scaling */
            @keyframes shadowPulse {
              0%, 100% { transform: scaleX(1); opacity: 0.15; }
              50% { transform: scaleX(0.7); opacity: 0.05; }
            }
            
            /* Circuit Data Processing Glow */
            @keyframes energyFlow {
              0%, 100% { stroke: #D2A782; filter: none; }
              50% { stroke: #FFFFFF; filter: drop-shadow(0 0 4px #FFFFFF); }
            }
            
            /* Loading Dots Blinking */
            @keyframes textBlink {
              0%, 20% { opacity: 0; }
              40%, 100% { opacity: 1; }
            }
            
            /* Class Assignments */
            .floater {
              animation: float 2s ease-in-out infinite;
            }
            .ground-shadow {
              animation: shadowPulse 2s ease-in-out infinite;
              transform-origin: 500px 540px;
            }
            
            /* Staggered Circuit Glows */
            .c-group1 { animation: energyFlow 2s infinite; }
            .c-group2 { animation: energyFlow 2s infinite 0.6s; }
            .c-group3 { animation: energyFlow 2s infinite 1.2s; }
            
            /* Staggered Dot Blinks */
            .dot1 { animation: textBlink 1.5s infinite; }
            .dot2 { animation: textBlink 1.5s infinite 0.3s; }
            .dot3 { animation: textBlink 1.5s infinite 0.6s; }
          `}</style>
        </defs>

        <ellipse cx="500" cy="540" rx="200" ry="12" fill="#000000" className="ground-shadow" />

        <g className="floater" transform="translate(0, -30)">
          <path d="M 250 100 L 750 100 L 750 220 L 900 220 L 900 320 L 750 320 L 750 380 L 750 500 L 680 500 L 680 380 L 630 380 L 630 500 L 560 500 L 560 380 L 440 380 L 440 500 L 370 500 L 370 380 L 320 380 L 320 500 L 250 500 L 250 380 L 250 320 L 100 320 L 100 220 L 250 220 Z" fill="#799CBB" stroke="#485D6F" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" filter="url(#shadow)" />

          <g fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <g className="c-group1" stroke="#D2A782">
              <path d="M 270 110 L 270 140 L 300 170" />
              <path d="M 470 110 L 450 130 L 370 130" />
              <path d="M 730 110 L 730 140 L 700 170" />
              <path d="M 590 110 L 610 130 L 630 130" />
            </g>
            
            <g className="c-group2" stroke="#D2A782">
              <path d="M 110 250 L 230 250 L 270 290 L 320 290" />
              <path d="M 110 290 L 210 290 L 250 340 L 250 370" />
              <path d="M 890 250 L 770 250 L 730 290 L 680 290" />
              <path d="M 890 290 L 790 290 L 750 340 L 750 370" />
            </g>

            <g className="c-group3" stroke="#D2A782">
              <path d="M 285 500 L 285 410 L 315 380 L 345 380" />
              <path d="M 395 500 L 395 430 L 435 390 L 490 390" />
              <path d="M 715 500 L 715 410 L 685 380 L 655 380" />
              <path d="M 605 500 L 605 430 L 565 390 L 510 390" />
            </g>
          </g>

          {robotHead}
        </g>

        <text x="500" y="610" textAnchor="middle" fontFamily="system-ui, -apple-system, sans-serif" fontSize="32" fontWeight="bold" fill="#485D6F" letterSpacing="6">
          LOADING<tspan className="dot1">.</tspan><tspan className="dot2">.</tspan><tspan className="dot3">.</tspan>
        </text>
      </svg>
    );
  }

  return null;
}

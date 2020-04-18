import { library } from '@fortawesome/fontawesome-svg-core'

/* Note that the we import icon individually otherwise all font-awesome icons will ship and increase the bundle size. */

// Genreal icons
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub'
import { faFlushed } from '@fortawesome/free-solid-svg-icons/faFlushed'
import { faLocationArrow } from '@fortawesome/free-solid-svg-icons/faLocationArrow'

// Faces for loading screen
import { faSmile } from '@fortawesome/free-solid-svg-icons/faSmile'
import { faMeh } from '@fortawesome/free-solid-svg-icons/faMeh'
import { faFrownOpen } from '@fortawesome/free-solid-svg-icons/faFrownOpen'
import { faFrown } from '@fortawesome/free-solid-svg-icons/faFrown'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle'

library.add(faFlushed, faLocationArrow, faGithub, faSmile, faMeh, faFrownOpen, faFrown, faInfoCircle)
export { faFlushed, faLocationArrow, faGithub, faSmile, faMeh, faFrownOpen, faFrown, faInfoCircle }

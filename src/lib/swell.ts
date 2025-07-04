import swell from 'swell-js'

const storeId = import.meta.env.VITE_SWELL_STORE_ID
const publicKey = import.meta.env.VITE_SWELL_PUBLIC_KEY

if (!storeId || !publicKey) {
  throw new Error('Missing required Swell configuration. Please check your environment variables.')
}

swell.init(storeId, publicKey)

export default swell
"use server"

import { getCustomerDigitalProducts, listSounds } from "./digital-products"

/**
 * Get the content URL for a purchased sound
 * @param soundId The ID of the sound
 * @param parentId The parent album ID (optional)
 * @returns The direct S3 URL to the sound file or null if not purchased
 */
export const getSoundContentUrl = async (soundId: string, parentId?: string) => {
  try {
    // Check if the user has purchased this sound
    const digitalProduct = await getCustomerDigitalProducts(soundId, parentId)
    
    // If purchased, return the content URL
    if (digitalProduct?.id && digitalProduct.content_url) {
      return digitalProduct.content_url
    }
    
    return null
  } catch (error) {
    console.error("Error getting sound content URL:", error)
    return null
  }
}

/**
 * Get all purchased sound content URLs from an album
 * @param albumId The ID of the album
 * @returns Array of sound files with name and URL
 */
export const getAlbumSoundUrls = async (albumId: string) => {
  try {
    // 1. Get all sounds in the album
    const { digital_products } = await listSounds({}, albumId)
    
    if (!digital_products || digital_products.length === 0) {
      throw new Error("No sounds found in this album")
    }
    
    // 2. Collect content URLs for all purchased sounds
    const soundFiles: { name: string; url: string }[] = []
    
    for (const sound of digital_products) {
      try {
        // Check if the sound is purchased
        const digitalProduct = await getCustomerDigitalProducts(sound.id, sound.parent_id || undefined)
        
        // If purchased and has content URL, add to the list
        if (digitalProduct?.id && digitalProduct.content_url) {
          soundFiles.push({
            name: sound.name,
            url: digitalProduct.content_url
          })
        }
      } catch (error) {
        console.error(`Error checking purchase for sound ${sound.id}:`, error)
      }
    }
    
    return soundFiles
  } catch (error) {
    console.error("Error getting album sound URLs:", error)
    throw error
  }
}

"use client"

/**
 * Helper function to download a file from a direct S3 URL
 * @param url The S3 URL of the file to download
 * @param filename The name to save the file as
 */
export const downloadFile = async (url: string, filename: string) => {
  try {
    // For S3 URLs, we need to fetch the file first and then create a blob

    // Fetch the file
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    // Convert to blob
    const blob = await response.blob()

    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob)

    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = blobUrl
    link.setAttribute("download", filename)

    // Append to the document
    document.body.appendChild(link)

    // Trigger the download
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl) // Free up memory
  } catch (error) {
    console.error("Error downloading file:", error)
    throw error
  }
}

/**
 * Helper function to download multiple files sequentially
 * @param files Array of file objects with name and url
 */
export const downloadMultipleFiles = async (
  files: { name: string; url: string }[]
) => {
  if (!files || files.length === 0) {
    throw new Error("No files to download")
  }

  // For a single file, just download it directly
  if (files.length === 1) {
    return downloadFile(files[0].url, `${files[0].name}.mp3`)
  }

  // For multiple files, download them sequentially with a small delay
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    await downloadFile(file.url, `${file.name}.mp3`)

    // Add a small delay between downloads to prevent browser blocking
    if (i < files.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

/**
 * Create a ZIP file from multiple audio files (not implemented yet)
 * This would require additional libraries to implement properly
 */
export const createZipFromAudioFiles = async (
  files: { name: string; url: string }[]
) => {
  // This would require a ZIP library like JSZip
  // For now, we'll just download files sequentially
  return downloadMultipleFiles(files)
}

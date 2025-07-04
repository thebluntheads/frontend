/**
 * Utility function to update Mux asset metadata after ad playback
 * This allows tracking ad completion status and watch time
 */
export async function updateMuxAssetMetadata(
  assetId: string,
  metadata: {
    custom_1?: string; // Ad status: "completed" or "skipped"
    custom_2?: string; // Watch time in seconds if skipped
    [key: string]: string | undefined;
  }
) {
  try {
    const response = await fetch('/api/mux/update-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assetId,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update Mux asset metadata:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error calling update metadata API:', error);
    return { success: false, error };
  }
}

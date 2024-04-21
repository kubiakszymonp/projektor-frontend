export const scaleAndTranslate = (
  originalWidth: number,
  originalHeight: number,
  targetWidth: number
) => {
  const scaleFactor = targetWidth / originalWidth;
  const translationX = (-(1 - scaleFactor) * originalWidth) / 2;
  const translationY = (-(1 - scaleFactor) * originalHeight) / 2;

  return {
    scaleFactor,
    translationX,
    translationY,
  };
};

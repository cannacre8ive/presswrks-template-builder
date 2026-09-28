# Artwork checks: scope and evidence

The browser reads file signatures rather than trusting the filename. JPEG headers identify dimensions, components, Adobe color markers, ICC declarations and EXIF rotation. PNG is RGB/indexed/grayscale, never CMYK. Effective PPI uses the actual pixel dimensions divided by the intended canvas size including bleed, not the file's DPI tag. Raster proportions allow a 0.5% tolerance for pixel rounding; PDF dimensions allow 0.01 inches.

PDF-lib reads explicit page boxes; PDF.js reads image placement operators and renders a local preview. Graphics transforms, rotation, user units and anisotropic/skewed scaling are included in PPI. Unsupported complex groups or repeated-image operators remain review items. Vector-only content has no fixed raster resolution. PDF color is always referred to prepress because a document can combine multiple color spaces and rendered screen RGB does not prove source color. The tool does not certify bleed artwork, output profiles, legal copy, fonts, overprint, transparency, cut paths or white-ink separations.

All unknowns stay review items. Even a matching CMYK image needs a human bleed and output-profile check. No automatic conversion, sharpening or enlargement is performed.

Sources used for implementation:

- [Adobe Acrobat preflight](https://helpx.adobe.com/acrobat/using/analyzing-documents-preflight-tool-acrobat.html)
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html) and installed version 6.3.289 source/types
- [PDF-lib page boxes](https://pdf-lib.js.org/docs/api/classes/pdfpage)
- [PNG specification](https://www.w3.org/TR/png-3/)
- [Google Apps Script web apps](https://developers.google.com/apps-script/guides/web)

The checked-in fixtures are generated synthetic color fields/PDF shapes, not customer artwork. The 90 × 90 px JPEG carries a 300 DPI tag but yields only 40 PPI on a 2.25 inch canvas and 45 PPI when placed at two inches in a PDF. This regression prevents the common metadata-only false pass.

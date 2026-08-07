import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface CampaignPostcardProps {
  postcardImageUrl: string;
}

const CampaignPostcard = ({ postcardImageUrl }: CampaignPostcardProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState(false);

  if (!postcardImageUrl) {
    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No postcard PDF uploaded
        </Typography>
      </Box>
    );
  }

  const isPdf =
    postcardImageUrl.toLowerCase().endsWith('.pdf') ||
    postcardImageUrl.includes('/pdf') ||
    postcardImageUrl.includes('application/pdf');

  if (!isPdf) {
    return (
      <Box sx={{ mt: 2 }}>
        <Box
          component="img"
          src={postcardImageUrl}
          alt="Campaign postcard"
          sx={{
            width: '100%',
            maxHeight: 200,
            objectFit: 'contain',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Box>
    );
  }

  const onDocumentLoadSuccess = ({ numPages: total }: { numPages: number }) => {
    setNumPages(total);
    setLoadError(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#f5f5f5',
          position: 'relative',
          minHeight: 200,
        }}
      >
        {loadError ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              Failed to load PDF
            </Typography>
          </Box>
        ) : (
          <Document
            file={postcardImageUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setLoadError(true)}
            loading={
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Loading PDF...
                </Typography>
              </Box>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={400}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}

        <IconButton
          size="small"
          href={postcardImageUrl}
          target="_blank"
          sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.8)' }}
        >
          <OpenInNewIcon fontSize="small" />
        </IconButton>
      </Box>

      {numPages > 1 && (
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1, gap: 1 }}
        >
          <IconButton
            size="small"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">
            {pageNumber} / {numPages}
          </Typography>
          <IconButton
            size="small"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default CampaignPostcard;

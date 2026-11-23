import Swal from 'sweetalert2'

export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function showSuccessAlert(title, text = '') {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 1800,
    showConfirmButton: false,
  })
}

export function showErrorAlert(title, text = '') {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Tutup',
  })
}

export async function showConfirmDialog(title, text = '') {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  })
  return Boolean(result.isConfirmed)
}

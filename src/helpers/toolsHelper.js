async function getSwal() {
  const { default: Swal } = await import('sweetalert2')
  return Swal
}

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

export async function showSuccessAlert(title, text = '') {
  const Swal = await getSwal()
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer: 1800,
    showConfirmButton: false,
  })
}

export async function showErrorAlert(title, text = '') {
  const Swal = await getSwal()
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Tutup',
  })
}

export async function showConfirmDialog(title, text = '') {
  const Swal = await getSwal()
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#475569',
    confirmButtonText: 'Ya, lanjutkan',
    cancelButtonText: 'Batal',
  })
  return Boolean(result.isConfirmed)
}

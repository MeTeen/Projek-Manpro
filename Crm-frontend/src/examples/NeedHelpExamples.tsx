// // Contoh penggunaan NeedHelp component dengan berbagai jenis kontak

// import { NeedHelp } from '../components/ui/NeedHelp';

// // Contoh 1: Customer Portal dengan Email dan Phone
// <NeedHelp 
//   variant="customer"
//   title="Butuh Bantuan?"
//   description="Hubungi tim customer support kami untuk bantuan dengan akun atau produk Anda."
//   contacts={[
//     { icon: "📱", label: "Phone", value: "+62 812-3456-7890", type: "phone" },
//     { icon: "✉️", label: "Email", value: "support@mebelpremium.com", type: "email" }
//   ]}
// />

// // Contoh 2: Customer Portal dengan WhatsApp
// <NeedHelp 
//   variant="customer"
//   title="Butuh Bantuan?"
//   description="Hubungi kami melalui WhatsApp untuk respon yang lebih cepat."
//   contacts={[
//     { icon: "💬", label: "WhatsApp", value: "+62 812-3456-7890", type: "whatsapp" },
//     { icon: "✉️", label: "Email", value: "support@mebelpremium.com", type: "email" }
//   ]}
// />

// // Contoh 3: Lengkap dengan semua jenis kontak
// <NeedHelp 
//   variant="customer"
//   title="Hubungi Kami"
//   description="Pilih cara yang paling mudah untuk menghubungi tim support kami."
//   contacts={[
//     { icon: "📱", label: "Telepon", value: "+62 812-3456-7890", type: "phone" },
//     { icon: "💬", label: "WhatsApp", value: "0812-3456-7890", type: "whatsapp" },
//     { icon: "✉️", label: "Email", value: "support@mebelpremium.com", type: "email" }
//   ]}
// />

// // Contoh 4: Dengan custom onClick handler
// <NeedHelp 
//   variant="customer"
//   title="Butuh Bantuan?"
//   description="Tim support kami siap membantu Anda."
//   contacts={[
//     { icon: "💬", label: "WhatsApp", value: "+62 812-3456-7890", type: "whatsapp" },
//     { icon: "✉️", label: "Email", value: "support@mebelpremium.com", type: "email" }
//   ]}
//   onContactClick={(contact) => {
//     // Custom handling
//     console.log('Contact clicked:', contact);
    
//     // Contoh: Track analytics
//     if (contact.type === 'whatsapp') {
//       // Track WhatsApp click
//       analytics.track('whatsapp_clicked', { value: contact.value });
//     }
    
//     // Kemudian lakukan default behavior
//     if (contact.type === 'whatsapp') {
//       const phoneNumber = contact.value.replace(/[^\d]/g, '');
//       const formattedPhone = phoneNumber.startsWith('62') ? phoneNumber : `62${phoneNumber.replace(/^0/, '')}`;
//       window.open(`https://wa.me/${formattedPhone}`, '_blank');
//     } else if (contact.type === 'email') {
//       window.open(`mailto:${contact.value}`, '_blank');
//     }
//   }}
// />

// /* 
// FITUR YANG TERSEDIA:

// 1. AUTOMATIC CLICK HANDLING:
//    - Email: Otomatis membuka aplikasi email dengan mailto:
//    - Phone: Otomatis membuka aplikasi telefon dengan tel:
//    - WhatsApp: Otomatis membuka wa.me dengan format nomor yang benar

// 2. PHONE NUMBER FORMATTING UNTUK WHATSAPP:
//    - Otomatis menghilangkan karakter non-digit
//    - Menambah kode negara 62 jika belum ada
//    - Mengganti awalan 0 dengan 62
//    - Contoh: "0812-3456-7890" → "6281234567890"

// 3. HOVER EFFECTS:
//    - Background berubah saat hover
//    - Cursor pointer untuk menunjukkan bisa diklik
//    - Tooltip menjelaskan aksi yang akan dilakukan

// 4. CUSTOMIZABLE:
//    - Bisa menambah custom onContactClick handler
//    - Tetap mendapat default behavior jika tidak ada custom handler
//    - Mendukung berbagai variant (customer, admin, default)

// 5. RESPONSIVE:
//    - Layout menyesuaikan dengan berbagai ukuran layar
//    - Text wrapping otomatis untuk kontak yang banyak
// */

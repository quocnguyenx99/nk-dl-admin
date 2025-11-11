import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// TAB QUẢN TRỊ
const AdminInfo = React.lazy(() => import('./views/admin/AdminInfo'))
const AdminGroup = React.lazy(() => import('./views/admin/AdminGroup'))
const AdminList = React.lazy(() => import('./views/admin/AdminList'))
const AdminLog = React.lazy(() => import('./views/admin/AdminLog'))
const AdminUpdateExcelPrice = React.lazy(() => import('./views/admin/AdminExcelUpdatePrice'))

// Permission Group
const PermissionGroup = React.lazy(() => import('./views/admin/PermissionGroup'))
const EditPermission = React.lazy(() => import('./views/admin/EditPermissions'))

// PARTNER
const PartnerCategories = React.lazy(() => import('./views/partner/category/PartnerCategories'))

const AddPartnerArticle = React.lazy(() => import('./views/partner/articles/AddPartnerArticle'))
const EditPartnerArticle = React.lazy(() => import('./views/partner/articles/EditPartnerArticle'))
const Partners = React.lazy(() => import('./views/partner/articles/Partners'))

// PRODUCT
const ProductOutOfSync = React.lazy(() => import('./views/product/productOutOfSync.js'))
const ProductBrand = React.lazy(() => import('./views/product/productBrand'))
const ProductCategory = React.lazy(() => import('./views/product/category/productCategory'))
const AddProductCategory = React.lazy(() => import('./views/product/category/AddProductCategory'))
const EditProductCategory = React.lazy(() => import('./views/product/category/EditProductCategory'))

// product properties
const ProductProperties = React.lazy(() => import('./views/product/properties/productProperties'))
const AddProductProperties = React.lazy(
  () => import('./views/product/properties/AddProductProperties'),
)
const EditProductProperties = React.lazy(
  () => import('./views/product/properties/EditProductProperties'),
)

// product banner
const ProductBanner = React.lazy(() => import('./views/product/banner/productBanner'))
const ProductBannerHotDeal = React.lazy(() => import('./views/product/banner/productBannerHotDeal'))
const ProductStatus = React.lazy(() => import('./views/product/status/productStatus'))

// product detail
const ProductDetail = React.lazy(() => import('./views/product/detail/ProductDetail'))
const AddProductDetail = React.lazy(() => import('./views/product/detail/AddProductDetail'))
const EditProductDetail = React.lazy(() => import('./views/product/detail/EditProductDetail'))

// product hot
const ProductHot = React.lazy(() => import('./views/product/productShow/productHot'))
const ProductFlashSale = React.lazy(() => import('./views/product/productShow/productFlashSale'))

// product configuration
const ProductConfig = React.lazy(() => import('./views/product/ProductConfig'))

// product demand
const ProductDemand = React.lazy(() => import('./views/product/demand/ProductDemand.js'))

//  ORDER
const OrderList = React.lazy(() => import('./views/order/orderInfo/orderList'))
const EditOrder = React.lazy(() => import('./views/order/orderInfo/EditOrder'))

const OrderStatus = React.lazy(() => import('./views/order/orderStatus'))
const PaymentMethod = React.lazy(() => import('./views/order/paymentMethod'))
const ShippingMethod = React.lazy(() => import('./views/order/shippingMethod'))

// COUPON
const Coupon = React.lazy(() => import('./views/coupon/Coupon'))
const AddCoupon = React.lazy(() => import('./views/coupon/AddCoupon'))
const EditCoupon = React.lazy(() => import('./views/coupon/EditCoupon'))
const DetailCoupon = React.lazy(() => import('./views/coupon/DetailCoupon'))
const Text = React.lazy(() => import('./views/coupon/Text'))

// NEWSLETTER
const Newsletter = React.lazy(() => import('./views/newsletter/Newsletter'))
const AddNewsletter = React.lazy(() => import('./views/newsletter/AddNewsletter'))
const EditNewsletter = React.lazy(() => import('./views/newsletter/EditNewsletter'))

// ACCESS STATISTICS
const AccessStatistics = React.lazy(() => import('./views/accessstatistics/AccessStatistics'))

// SEO
const Seo = React.lazy(() => import('./views/seo/SocialsIcon'))
const Sitemap = React.lazy(() => import('./views/seo/SitempaXML'))
const Links = React.lazy(() => import('./views/seo/LinkManagement'))
const LinksRedirect = React.lazy(() => import('./views/seo/LinkRedirect'))

// GIFT
const Gift = React.lazy(() => import('./views/gift/Gift'))
const AddGift = React.lazy(() => import('./views/gift/AddGift'))
const EditGift = React.lazy(() => import('./views/gift/EditGift'))

// MEMBER
const Member = React.lazy(() => import('./views/member/Member'))
const EditMember = React.lazy(() => import('./views/member/EditMember'))

const MemberCreate = React.lazy(() => import('./views/member/MemberCreate'))

// PROMOTION
const PromotionDetail = React.lazy(
  () => import('./views/promotion/promotionDetail/promotionDetail'),
)
const AddPromotionDetail = React.lazy(
  () => import('./views/promotion/promotionDetail/AddPromotionDetail'),
)
const EditPromotionDetail = React.lazy(
  () => import('./views/promotion/promotionDetail/EditPromotionDetail'),
)

// promotion news
const PromotionNews = React.lazy(() => import('./views/promotion/promotionNews/promotionNews'))
const AddPromotionNews = React.lazy(
  () => import('./views/promotion/promotionNews/AddPromotionNews'),
)
const EditPromotionNews = React.lazy(
  () => import('./views/promotion/promotionNews/EditPromotionNews'),
)

// SUPPORT
const Support = React.lazy(() => import('./views/support/Support'))
const GroupSupport = React.lazy(() => import('./views/support/GroupSupport'))

// COMMENT
const Comment = React.lazy(() => import('./views/comment/Comment'))
const AddComment = React.lazy(() => import('./views/comment/AddComment'))
const EditComment = React.lazy(() => import('./views/comment/EditComment'))

// NEWS CATEGORY
const NewsCategory = React.lazy(() => import('./views/news/category/NewsCategory'))

// NEWS DETAIL
const News = React.lazy(() => import('./views/news/detail/News'))
const AddNews = React.lazy(() => import('./views/news/detail/AddNews'))
const EditNews = React.lazy(() => import('./views/news/detail/EditNews'))

// ADVERTISE

// advertise category
const AdvertiseCategory = React.lazy(() => import('./views/advertise/category/AdvertiseCategory'))

// advertise detail
const Advertise = React.lazy(() => import('./views/advertise/detail/Advertise'))
const AddAdvertise = React.lazy(() => import('./views/advertise/detail/AddAdvertise'))
const EditAdvertise = React.lazy(() => import('./views/advertise/detail/EditAdvertise'))

// INTRODUCE
const Introduce = React.lazy(() => import('./views/introduce/Introduce'))
const AddIntroduce = React.lazy(() => import('./views/introduce/AddIntroduce'))
const EditIntroduce = React.lazy(() => import('./views/introduce/EditIntroduce'))

const VideoPress = React.lazy(() => import('./views/introduce/VideoPress.js'))

// SERVICE
const Service = React.lazy(() => import('./views/services/Service'))
const AddService = React.lazy(() => import('./views/services/AddService'))
const EditService = React.lazy(() => import('./views/services/EditService'))

// INSTRUCTION
const Instruction = React.lazy(() => import('./views/instruction/Instruction'))
const AddInstruction = React.lazy(() => import('./views/instruction/AddInstruction'))
const EditInstruction = React.lazy(() => import('./views/instruction/EditInstruction'))

// CONSULTANT

const ConsultantCategory = React.lazy(
  () => import('./views/consultant/category/ConsultantCategory'),
)

// consultant detail
const Consultant = React.lazy(() => import('./views/consultant/detail/Consultant'))
const AddConsultant = React.lazy(() => import('./views/consultant/detail/AddConsultant'))
const EditConsultant = React.lazy(() => import('./views/consultant/detail/EditConsultant'))

// CONTACT

// PRICE MANAGEMENT
const PriceManagement = React.lazy(() => import('./views/contact/priceManagement/priceManagement'))
const EditPriceManagement = React.lazy(
  () => import('./views/contact/priceManagement/EditPriceManagement'),
)

// ADDRESS MANAGEMENT
const AddressManagement = React.lazy(
  () => import('./views/contact/addressManagement/addressManagement'),
)
const EditAddressManagement = React.lazy(
  () => import('./views/contact/addressManagement/EditAddressManagement'),
)

// CONTACT MANAGEMENT
const ContactManagement = React.lazy(
  () => import('./views/contact/contactManagement/contactManagement'),
)
const EditContactManagement = React.lazy(
  () => import('./views/contact/contactManagement/EditContactManagement'),
)

// DEPARTMENT
const Department = React.lazy(() => import('./views/contact/department/department'))

// SYSTEMS
const SystemConfig = React.lazy(() => import('./views/system/SystemConfig'))
const SystemData = React.lazy(() => import('./views/system/SystemData'))
const SystemBackup = React.lazy(() => import('./views/system/SystemBackup'))

// CONTENT & FORM
const Menu = React.lazy(() => import('./views/content/Menu'))
const MailTemp = React.lazy(() => import('./views/content/mailTemp/MailTemplate'))
const AddMailTemp = React.lazy(() => import('./views/content/mailTemp/AddMailTemplate'))
const EditMailTemp = React.lazy(() => import('./views/content/mailTemp/EditMailTemplate'))

// HIRE
const HireCategory = React.lazy(() => import('./views/hire/HireCategory.js'))
const HireDetail = React.lazy(() => import('./views/hire/HireDetail.js'))
const AddHirePost = React.lazy(() => import('./views/hire/AddHirePost.js'))
const EditHirePost = React.lazy(() => import('./views/hire/EditHirePost.js'))

const CandidateCV = React.lazy(() => import('./views/hire/CandidateCV.js'))
const EditCandidateCV = React.lazy(() => import('./views/hire/EditCandidateCV.js'))

// LIBRARY
const Library = React.lazy(() => import('./views/library/Library.js'))

/** ------------------------------------------------------------------------------------------------------------------ */

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },

  { path: '/admin', name: 'Admin', element: AdminInfo, exact: true },
  { path: '/admin/information', name: 'AdminInfo', element: AdminInfo },
  { path: '/admin/groups', name: 'AdminGroup', element: AdminGroup },
  { path: '/admin/list', name: 'AdminList', element: AdminList },
  { path: '/admin/log', name: 'AdminLog', element: AdminLog },

  { path: '/admin', name: 'Admin', element: AdminInfo, exact: true },

  {
    path: '/admin/permissions-group',
    name: 'PermissionGroup',
    element: PermissionGroup,
    exact: true,
  },

  {
    path: '/admin/groups/edit',
    name: 'EditPermission',
    element: EditPermission,
    exact: true,
  },

  // PARTNER
  {
    path: '/partner/categories',
    name: 'PartnerCategories',
    element: PartnerCategories,
    exact: true,
  },

  {
    path: '/partner/article/add',
    name: 'AddPartnerArticle',
    element: AddPartnerArticle,
    exact: true,
  },

  {
    path: '/partner/article/edit',
    name: 'EditPartnerArticle',
    element: EditPartnerArticle,
    exact: true,
  },

  {
    path: '/partner/articles',
    name: 'Partners',
    element: Partners,
    exact: true,
  },

  // product detail
  {
    path: '/product/update-excel-price',
    name: 'AdminUpdateExcelPrice',
    element: AdminUpdateExcelPrice,
  },

  {
    path: '/product/out-of-sync',
    name: 'ProductOutOfSync',
    element: ProductOutOfSync,
  },

  { path: '/product', name: 'ProductDetail', element: ProductDetail },

  {
    path: '/product/add',
    name: 'AddProductDetail',
    element: AddProductDetail,
    exact: true,
  },
  {
    path: '/product/edit',
    name: 'EditProductCategory',
    element: EditProductDetail,
    exact: true,
  },

  // show product
  {
    path: '/product/product-hot',
    name: 'ProductHot',
    element: ProductHot,
    exact: true,
  },

  {
    path: '/product/product-flash-sale',
    name: 'ProductFlashSale',
    element: ProductFlashSale,
    exact: true,
  },

  //product brand
  { path: '/product/brand', name: 'ProductBrand', element: ProductBrand, exact: true },

  //product categories
  { path: '/product/category', name: 'ProductCategory', element: ProductCategory, exact: true },
  {
    path: '/product/category/add',
    name: 'AddProductCategory',
    element: AddProductCategory,
    exact: true,
  },
  {
    path: '/product/category/edit',
    name: 'EditProductCategory',
    element: EditProductCategory,
    exact: true,
  },

  // product properties
  {
    path: '/product/properties',
    name: 'ProductProperties',
    element: ProductProperties,
    exact: true,
  },

  {
    path: '/product/properties/add',
    name: 'AddProductProperties',
    element: AddProductProperties,
    exact: true,
  },

  {
    path: '/product/properties/edit',
    name: 'EditProductProperties',
    element: EditProductProperties,
    exact: true,
  },

  // product banner
  {
    path: '/product/banner',
    name: 'ProductBanner',
    element: ProductBanner,
    exact: true,
  },

  // product banner hot-deal
  {
    path: '/product/banner-hot-deal',
    name: 'ProductBannerHotDeal',
    element: ProductBannerHotDeal,
    exact: true,
  },

  // product status
  {
    path: '/product/status',
    name: 'ProductStatus',
    element: ProductStatus,
    exact: true,
  },

  // product config

  {
    path: '/product/config',
    name: 'ProductConfig',
    element: ProductConfig,
    exact: true,
  },

  // product demand
  {
    path: '/product/demand',
    name: 'ProductDemand',
    element: ProductDemand,
    exact: true,
  },

  // coupon
  { path: '/coupon', name: 'Coupon', element: Coupon, exact: true },

  {
    path: 'coupon/add',
    name: 'AddCoupon',
    element: AddCoupon,
    exact: true,
  },
  {
    path: 'coupon/edit',
    name: 'EditCoupon',
    element: EditCoupon,
    exact: true,
  },

  // detail coupon
  { path: '/detail-coupon', name: 'DetailCoupon', element: DetailCoupon, exact: true },

  // newsletter
  { path: '/newsletter', name: 'Newsletter', element: Newsletter, exact: true },
  { path: '/newsletter/add', name: 'AddNewsletter', element: AddNewsletter, exact: true },
  { path: '/newsletter/edit', name: 'EditNewsletter', element: EditNewsletter, exact: true },

  { path: '/text', name: 'Text', element: Text, exact: true },

  // access statistics
  { path: '/access-statistics', name: 'AccessStatistics', element: AccessStatistics, exact: true },

  // seo
  { path: '/seo/social-icons', name: 'Seo', element: Seo, exact: true },
  { path: '/seo/sitemap', name: 'Sitemap', element: Sitemap, exact: true },
  { path: '/seo/links', name: 'Links', element: Links, exact: true },
  { path: '/seo/links-redirect', name: 'LinksRedirect', element: LinksRedirect, exact: true },

  // gift
  { path: '/gift', name: 'Gift', element: Gift, exact: true },
  {
    path: 'gift/add',
    name: 'AddGift',
    element: AddGift,
    exact: true,
  },
  {
    path: 'gift/edit',
    name: 'EditGift',
    element: EditGift,
    exact: true,
  },

  //order
  {
    path: '/order',
    name: 'OrderList',
    element: OrderList,
    exact: true,
  },
  {
    path: '/order/edit',
    name: 'EditOrder',
    element: EditOrder,
    exact: true,
  },

  // order status
  {
    path: '/order/status',
    name: 'OrderStatus',
    element: OrderStatus,
    exact: true,
  },

  // payment-method
  {
    path: '/order/payment-method',
    name: 'PaymentMethod',
    element: PaymentMethod,
    exact: true,
  },

  // shipping-method
  {
    path: '/order/shipping-method',
    name: 'ShippingMethod',
    element: ShippingMethod,
    exact: true,
  },

  // member
  {
    path: '/member',
    name: 'Member',
    element: Member,
    exact: true,
  },

  {
    path: '/member/edit',
    name: 'EditMember',
    element: EditMember,
    exact: true,
  },

  {
    path: '/member/create',
    name: 'CreateMember',
    element: MemberCreate,
    exact: true,
  },

  //promotion
  { path: '/promotion-detail', name: 'Promotion', element: PromotionDetail, exact: true },
  {
    path: 'promotion-detail/add',
    name: 'AddPromotionDetail',
    element: AddPromotionDetail,
    exact: true,
  },

  {
    path: 'promotion-detail/edit',
    name: 'EditPromotionDetail',
    element: EditPromotionDetail,
    exact: true,
  },

  { path: '/promotion', name: 'Promotion', element: PromotionNews, exact: true },

  {
    path: 'promotion/add',
    name: 'AddPromotionNews',
    element: AddPromotionNews,
    exact: true,
  },
  {
    path: 'promotion/edit',
    name: 'EditPromotionNews',
    element: EditPromotionNews,
    exact: true,
  },

  // support
  {
    path: '/group-support',
    name: 'GroupSupport',
    element: GroupSupport,
    exact: true,
  },

  {
    path: '/support',
    name: 'Support',
    element: Support,
    exact: true,
  },

  // comment
  {
    path: '/comment',
    name: 'Comment',
    element: Comment,
    exact: true,
  },

  {
    path: 'comment/edit',
    name: 'EditComment',
    element: EditComment,
    exact: true,
  },

  // news
  { path: '/news', name: 'News', element: News, exact: true },
  {
    path: 'news/add',
    name: 'AddNews',
    element: AddNews,
    exact: true,
  },
  {
    path: 'news/edit',
    name: 'EditNews',
    element: EditNews,
    exact: true,
  },

  // category
  {
    path: 'news/category',
    name: 'NewsCategory',
    element: NewsCategory,
    exact: true,
  },

  // advertise category
  {
    path: 'advertise/category',
    name: 'AdvertiseCategory',
    element: AdvertiseCategory,
    exact: true,
  },

  // advertise
  { path: '/advertise', name: 'Advertise', element: Advertise, exact: true },
  {
    path: 'advertise/add',
    name: 'AddAdvertise',
    element: AddAdvertise,
    exact: true,
  },
  {
    path: 'advertise/edit',
    name: 'EditAdvertise',
    element: EditAdvertise,
    exact: true,
  },

  // introduce
  { path: '/about', name: 'Introduce', element: Introduce, exact: true },
  {
    path: 'about/add',
    name: 'AddIntroduce',
    element: AddIntroduce,
    exact: true,
  },
  {
    path: 'about/edit',
    name: 'EditIntroduce',
    element: EditIntroduce,
    exact: true,
  },

  // video and press
  {
    path: '/about/video',
    name: 'VideoPress',
    element: VideoPress,
    exact: true,
  },

  // service
  { path: '/service', name: 'Service', element: Service, exact: true },
  {
    path: 'service/add',
    name: 'AddService',
    element: AddService,
    exact: true,
  },
  {
    path: 'service/edit',
    name: 'EditService',
    element: EditService,
    exact: true,
  },

  // instruction
  { path: '/guide', name: 'Instruction', element: Instruction, exact: true },
  {
    path: 'guide/add',
    name: 'AddInstruction',
    element: AddInstruction,
    exact: true,
  },
  {
    path: 'guide/edit',
    name: 'EditInstruction',
    element: EditInstruction,
    exact: true,
  },

  // consultant

  // category
  {
    path: 'consultant/category',
    name: 'ConsultantCategory',
    element: ConsultantCategory,
    exact: true,
  },

  //detail

  { path: '/consultant', name: 'Consultant', element: Consultant, exact: true },
  {
    path: 'consultant/add',
    name: 'AddConsultant',
    element: AddConsultant,
    exact: true,
  },
  {
    path: 'consultant/edit',
    name: 'EditConsultant',
    element: EditConsultant,
    exact: true,
  },

  // contact

  // bao gia
  { path: '/price-management', name: 'PriceManagement', element: PriceManagement, exact: true },
  {
    path: 'price-management/edit',
    name: 'EditPriceManagement',
    element: EditPriceManagement,
    exact: true,
  },

  // so dia chi
  {
    path: '/address',
    name: 'AddressManagement',
    element: AddressManagement,
    exact: true,
  },
  {
    path: 'address/edit',
    name: 'EditAddressManagement',
    element: EditAddressManagement,
    exact: true,
  },

  // lien he

  {
    path: '/contact',
    name: 'ContactManagement',
    element: ContactManagement,
    exact: true,
  },
  {
    path: 'contact/edit',
    name: 'EditContactManagement',
    element: EditContactManagement,
    exact: true,
  },

  // phong ban

  {
    path: '/department',
    name: 'Department',
    element: Department,
    exact: true,
  },

  // he thong
  {
    path: '/system-config',
    name: 'SystemConfig',
    element: SystemConfig,
    exact: true,
  },
  {
    path: '/system-data',
    name: 'SystemData',
    element: SystemData,
    exact: true,
  },
  {
    path: '/system-backup',
    name: 'SystemBackup',
    element: SystemBackup,
    exact: true,
  },

  // hinh thuc noi dung
  {
    path: '/content/menu',
    name: 'Menu',
    element: Menu,
    exact: true,
  },

  {
    path: '/content/mail-temp',
    name: 'MailTemp',
    element: MailTemp,
    exact: true,
  },
  {
    path: '/content/mail-temp/add',
    name: 'AddMailTemp',
    element: AddMailTemp,
    exact: true,
  },
  {
    path: '/content/mail-temp/edit',
    name: 'EditMailTemp',
    element: EditMailTemp,
    exact: true,
  },

  // hire
  {
    path: '/hire/category',
    name: 'HireCategory',
    element: HireCategory,
    exact: true,
  },
  {
    path: '/hire/post',
    name: 'HireDetail',
    element: HireDetail,
    exact: true,
  },
  {
    path: '/hire/post/add',
    name: 'AddHirePost',
    element: AddHirePost,
    exact: true,
  },
  {
    path: '/hire/post/edit',
    name: 'EditHirePost',
    element: EditHirePost,
    exact: true,
  },

  {
    path: '/hire/candidate-cv',
    name: 'CandidateCV',
    element: CandidateCV,
    exact: true,
  },

  {
    path: '/hire/candidate-cv/edit',
    name: 'EditCandidateCV',
    element: EditCandidateCV,
    exact: true,
  },

  // library
  {
    path: '/library',
    name: 'Library',
    element: Library,
    exact: true,
  },
]

export default routes

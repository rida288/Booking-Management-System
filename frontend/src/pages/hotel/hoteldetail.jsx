import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RoomCard from "../../components/rooms/roomcard";
import BookingForm from "../../components/bookings/BookingForm";
import { getHotelById } from "../../services/hotel.service";
import { getRoomsByHotel } from "../../services/room.service";
import { getReviewsByHotel } from "../../services/review.service";
import { useAuth } from "../../hooks/useAuth";
import { getHotelAmenities } from "../../services/amenities.service";

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [hotelRes, roomRes, reviewRes, amenityRes] = await Promise.all([
        getHotelById(id),
        getRoomsByHotel(id),
        getReviewsByHotel(id),
        getHotelAmenities(id),
      ]);
      setHotel(hotelRes.data?.data || hotelRes.data);
      setRooms(roomRes.data?.data || []);
      setReviews(reviewRes.data?.data || reviewRes.data || []);
      setAmenities(amenityRes.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBook = (room) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedRoom(room);
  };

  if (!hotel) return <p style={{ padding: "40px", textAlign: "center" }}>Loading...</p>;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div style={styles.wrap}>
      {/* Hero Card */}
      <div style={styles.heroCard}>
        <h2 style={styles.name}>{hotel.name}</h2>
        <p style={styles.location}>📍 {hotel.city}, {hotel.province}, {hotel.country}</p>
        <div style={styles.ratingRow}>
          <p style={styles.stars}>{"⭐".repeat(hotel.star_rating || 0)}</p>
          {avgRating && (
            <span style={styles.avgBadge}>⭐ {avgRating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        {hotel.description && <p style={styles.desc}>{hotel.description}</p>}
        <div style={styles.info}>
          {hotel.address && (
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Address</div>
              <div style={styles.infoVal}>{hotel.address}</div>
            </div>
          )}
          {hotel.check_in_time && (
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Check-in</div>
              <div style={styles.infoVal}>{hotel.check_in_time}</div>
            </div>
          )}
          {hotel.check_out_time && (
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Check-out</div>
              <div style={styles.infoVal}>{hotel.check_out_time}</div>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Policy */}
      {hotel.cancellation_policy && (
        <div style={styles.policyCard}>
          <strong>Cancellation Policy:</strong> {hotel.cancellation_policy}
        </div>
      )}

      {amenities.length > 0 && (
        <div style={styles.amenitiesCard}>
          <h3 style={styles.sectionHeading}>Hotel Amenities</h3>
          <div style={styles.amenitiesGrid}>
            {amenities.map(a => (
              <span key={a.amenity_id} style={styles.amenityBadge}>✓ {a.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Login nudge for guests */}
      {!user && (
        <div style={styles.loginNudge}>
          Please{" "}
          <strong style={styles.loginLink} onClick={() => navigate("/login")}>
            log in
          </strong>{" "}
          to book a room.
        </div>
      )}

      {/* Rooms + Booking Form */}
      <div style={styles.layout}>
        <div style={styles.rooms}>
          <h3 style={styles.sectionHeading}>Available Rooms</h3>
          {rooms.length === 0 ? (
            <p style={styles.empty}>No rooms available.</p>
          ) : (
            rooms.map((room) => (
              <RoomCard
                key={room.room_type_id}
                room={room}
                onBook={() => handleBook(room)}
                selected={selectedRoom?.room_type_id === room.room_type_id}
              />
            ))
          )}
        </div>

        {selectedRoom && (
          <div style={styles.formWrap}>
            <BookingForm roomType={selectedRoom} hotelName={hotel.name} />
          </div>
        )}
      </div>

      {/* Reviews */}
      <div style={styles.reviewsSection}>
        <h3 style={styles.sectionHeading}>
          Guest Reviews {reviews.length > 0 && <span style={styles.reviewCount}>({reviews.length})</span>}
        </h3>

        {reviewsLoading ? (
          <p style={styles.empty}>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p style={styles.empty}>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.review_id || review.id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.reviewAvatar}>
                  {(review.guest_name || "A")[0].toUpperCase()}
                </div>
                <div style={styles.reviewMeta}>
                  <span style={styles.reviewAuthor}>{review.guest_name || "Anonymous"}</span>
                  <span style={styles.reviewDate}>
                    {review.created_at
                      ? new Date(review.created_at).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })
                      : ""}
                  </span>
                </div>
                <div style={styles.reviewRating}>
                  {"⭐".repeat(Math.round(review.overall_rating || 0))}
                  <span style={styles.ratingNum}> {review.overall_rating}</span>
                </div>
              </div>

              {review.title && <p style={styles.reviewTitle}>{review.title}</p>}
              {review.body && <p style={styles.reviewComment}>{review.body}</p>}

              {review.host_response && (
                <div style={styles.hostResponse}>
                  <span style={styles.hostResponseLabel}>🏨 Host response</span>
                  <p style={styles.hostResponseText}>{review.host_response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  wrap: { maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" },

  // Hero
  heroCard: { background: "#fff", border: "1px solid #e0e0e0", borderRadius: "12px", padding: "28px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" },
  name: { margin: "0 0 6px", fontSize: "28px", fontWeight: "700", color: "#1a1a2e" },
  location: { color: "#666", margin: "0 0 6px", fontSize: "14px" },
  ratingRow: { display: "flex", alignItems: "center", gap: "12px", margin: "0 0 12px" },
  stars: { margin: 0, fontSize: "16px" },
  avgBadge: { background: "#f0f4ff", color: "#3b5bdb", fontSize: "13px", fontWeight: "600", padding: "3px 10px", borderRadius: "20px" },
  desc: { color: "#555", fontSize: "14px", lineHeight: "1.6", margin: "0 0 16px" },
  info: { display: "flex", gap: "24px", flexWrap: "wrap", paddingTop: "16px", borderTop: "1px solid #f0f0f0" },
  infoItem: { minWidth: "120px" },
  infoLabel: { color: "#888", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" },
  infoVal: { fontWeight: "600", fontSize: "14px", color: "#1a1a2e" },

  // Policy
  policyCard: { background: "#fff3cd", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" },

  // Login nudge
  loginNudge: { background: "#f0f4ff", border: "1px solid #c5d3f7", borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#333", marginBottom: "20px" },
  loginLink: { color: "#3b5bdb", cursor: "pointer", textDecoration: "underline" },

  // Layout
  layout: { display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" },
  rooms: {},
  formWrap: { position: "sticky", top: "20px" },
  empty: { color: "#666", textAlign: "center", padding: "40px" },

  sectionHeading: { fontSize: "20px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px" },

  // Reviews
  reviewsSection: { marginTop: "48px", paddingTop: "32px", borderTop: "2px solid #f0f0f0" },
  reviewCount: { color: "#888", fontWeight: "400", fontSize: "16px" },
  reviewCard: { background: "#fff", border: "1px solid #e8e8e8", borderRadius: "12px", padding: "20px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  reviewHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  reviewAvatar: { width: "38px", height: "38px", borderRadius: "50%", background: "#1a1a2e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", flexShrink: 0 },
  reviewMeta: { display: "flex", flexDirection: "column", gap: "2px", flex: 1 },
  reviewAuthor: { fontWeight: "700", fontSize: "14px", color: "#1a1a2e" },
  reviewDate: { color: "#aaa", fontSize: "12px" },
  reviewRating: { fontSize: "13px", whiteSpace: "nowrap" },
  ratingNum: { color: "#555", fontWeight: "600" },
  reviewTitle: { fontWeight: "700", fontSize: "14px", color: "#1a1a2e", margin: "0 0 6px" },
  reviewComment: { color: "#555", fontSize: "14px", lineHeight: "1.7", margin: "0" },
  hostResponse: { marginTop: "12px", background: "#f8f9ff", border: "1px solid #e0e8ff", borderRadius: "8px", padding: "12px 14px" },
  hostResponseLabel: { fontSize: "12px", fontWeight: "700", color: "#3b5bdb", display: "block", marginBottom: "6px" },
  hostResponseText: { margin: 0, fontSize: "13px", color: "#444", lineHeight: "1.6" },
  amenitiesCard: { background:'#fff', border:'1px solid #e0e0e0', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' },
  amenitiesGrid: { display:'flex', flexWrap:'wrap', gap:'10px', marginTop:'12px' },
  amenityBadge: { padding:'6px 14px', background:'#f0f4ff', color:'#1a1a2e', borderRadius:'20px', fontSize:'13px', fontWeight:'500', border:'1px solid #c0d0ff' },
};

export default HotelDetail;